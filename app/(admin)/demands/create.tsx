import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { AppTextInput } from "../../../components/forms/AppTextInput";
import { AppPicker } from "../../../components/forms/AppPicker";
import { AppButton } from "../../../components/forms/AppButton";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";
import { QueryKeys } from "../../../constants/queryKeys";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";
import {
  assignDemand,
  createDemand,
  listDistricts,
  listInstitutions,
  listUsers,
} from "../../../services/dcb";
import { parseAmount } from "../../../utils/formatCurrency";
import { getCurrentFY, financialYearSelectOptions } from "../../../utils/formatDate";

const schema = z.object({
  districtId: z.string().uuid("Select district"),
  institutionId: z.string().uuid("Select institution"),
  financialYear: z.string().min(5, "Select financial year"),
  amountDue: z.string().min(1, "Enter amount"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .refine((s) => dayjs(s, "YYYY-MM-DD", true).isValid(), "Invalid date"),
  inspectorId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminCreateDemandScreen() {
  const qc = useQueryClient();
  const fyOpts = useMemo(() => financialYearSelectOptions(), []);

  const dq = useQuery({ queryKey: QueryKeys.DISTRICTS, queryFn: listDistricts });
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      districtId: "",
      institutionId: "",
      financialYear: getCurrentFY(),
      amountDue: "",
      dueDate: dayjs().format("YYYY-MM-DD"),
      inspectorId: "",
    },
  });

  const districtId = form.watch("districtId");

  const iq = useQuery({
    queryKey: QueryKeys.INSTITUTIONS({ districtId }),
    queryFn: () => listInstitutions({ districtId }),
    enabled: districtId.length > 0,
  });

  const uq = useQuery({
    queryKey: QueryKeys.USERS({ role: "INSPECTOR", districtId }),
    queryFn: () => listUsers({ role: "INSPECTOR", districtId }),
    enabled: districtId.length > 0,
  });

  const mut = useMutation({
    mutationFn: async (vals: FormValues) => {
      const amt = parseAmount(vals.amountDue);
      if (amt <= 0) {
        throw new Error("Amount must be greater than zero");
      }
      const dueIso = dayjs(vals.dueDate, "YYYY-MM-DD").toDate().toISOString();
      const created = await createDemand({
        districtId: vals.districtId,
        institutionId: vals.institutionId,
        amountDue: amt,
        financialYear: vals.financialYear,
        dueDate: dueIso,
      });
      if (vals.inspectorId !== undefined && vals.inspectorId.length > 0) {
        await assignDemand(created.id, vals.inspectorId);
      }
      return created;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["demands"] });
      router.back();
    },
  });

  if (dq.isError) {
    const msg = dq.error instanceof Error ? dq.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Create Demand" onBack={() => router.back()} />
        <ErrorScreen message={msg} error={dq.error} onRetry={() => void dq.refetch()} />
      </ScreenWrapper>
    );
  }

  if (dq.isLoading) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Create Demand" onBack={() => router.back()} />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList />
        </View>
      </ScreenWrapper>
    );
  }

  const districtOpts =
    dq.data?.map((d) => ({ label: `${d.name} (${d.code})`, value: d.id })) ?? [];
  const instOpts =
    iq.data?.map((i) => ({ label: i.name, value: i.id })) ?? [];
  const inspectorOpts: { label: string; value: string }[] = [
    { label: "Unassigned", value: "" },
    ...(uq.data?.map((u) => ({ label: `${u.name} · ${u.phone ?? ""}`, value: u.id })) ?? []),
  ];

  return (
    <ScreenWrapper scrollable omitStatusBar>
      <AppHeader title="Create Demand" onBack={() => router.back()} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.pad}>
        <AppPicker
          label="District"
          options={districtOpts}
          value={form.watch("districtId")}
          onChange={(v) => {
            form.setValue("districtId", v);
            form.setValue("institutionId", "");
            form.setValue("inspectorId", "");
          }}
          error={form.formState.errors.districtId?.message}
        />
        {districtId.length > 0 && iq.isError ? (
          <Text style={styles.err}>
            {iq.error instanceof Error ? iq.error.message : "Could not load institutions"}
          </Text>
        ) : null}
        <AppPicker
          label="Institution"
          options={instOpts}
          value={form.watch("institutionId")}
          onChange={(v) => form.setValue("institutionId", v)}
          error={form.formState.errors.institutionId?.message}
        />
        {districtId.length > 0 && uq.isError ? (
          <Text style={styles.err}>
            {uq.error instanceof Error ? uq.error.message : "Could not load inspectors"}
          </Text>
        ) : null}
        <AppPicker
          label="Financial Year"
          options={fyOpts}
          value={form.watch("financialYear")}
          onChange={(v) => form.setValue("financialYear", v)}
          error={form.formState.errors.financialYear?.message}
        />
        <Controller
          control={form.control}
          name="amountDue"
          render={({ field: { onChange, value } }) => (
            <AppTextInput
              label="Amount Due (₹)"
              keyboardType="decimal-pad"
              value={value}
              onChangeText={onChange}
              error={form.formState.errors.amountDue?.message}
              hint="Indian rupees, numbers only"
            />
          )}
        />
        <Controller
          control={form.control}
          name="dueDate"
          render={({ field: { onChange, value } }) => (
            <AppTextInput
              label="Due Date (YYYY-MM-DD)"
              value={value}
              onChangeText={onChange}
              error={form.formState.errors.dueDate?.message}
            />
          )}
        />
        <AppPicker
          label="Assign Inspector (optional)"
          options={inspectorOpts}
          value={form.watch("inspectorId") ?? ""}
          onChange={(v) => form.setValue("inspectorId", v)}
        />
        {mut.isError ? (
          <Text style={styles.err}>
            {mut.error instanceof Error ? mut.error.message : "Failed to create"}
          </Text>
        ) : null}
        <AppButton
          label={mut.isPending ? "Submitting…" : "Create Demand"}
          fullWidth
          onPress={() => void form.handleSubmit((vals) => mut.mutate(vals))()}
          loading={mut.isPending}
          style={{ marginTop: Spacing.xl }}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  pad: { paddingBottom: Spacing["4xl"] },
  err: { color: Colors.danger, marginTop: Spacing.md, fontSize: Typography.sizes.sm },
});
