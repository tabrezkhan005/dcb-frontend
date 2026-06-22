import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { AppTextInput } from "../../../components/forms/AppTextInput";
import { AppPicker } from "../../../components/forms/AppPicker";
import { AppButton } from "../../../components/forms/AppButton";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";
import { QueryKeys } from "../../../constants/queryKeys";
import { createInstitution, listDistricts } from "../../../services/dcb";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";
import { alertError } from "../../../utils/errors";

const schema = z.object({
  districtId: z.string().uuid("Select district"),
  name: z.string().min(2, "Enter institution name"),
  category: z.string().min(2, "Enter category"),
  address: z.string().min(5, "Enter address"),
  contactName: z.string().min(2, "Enter contact name"),
  contactPhone: z.string().regex(/^\d{10}$/, "10-digit phone"),
});

type FormValues = z.infer<typeof schema>;

const categoryOptions = [
  { label: "Education", value: "Education" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Trade", value: "Trade" },
  { label: "Religious", value: "Religious" },
  { label: "Other", value: "Other" },
];

export default function AdminCreateInstitutionScreen() {
  const qc = useQueryClient();
  const dq = useQuery({ queryKey: QueryKeys.DISTRICTS, queryFn: listDistricts });
  const districtOpts = useMemo(
    () => (dq.data ?? []).map((d) => ({ label: `${d.name} (${d.code})`, value: d.id })),
    [dq.data],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      districtId: "",
      name: "",
      category: "Education",
      address: "",
      contactName: "",
      contactPhone: "",
    },
  });

  const mut = useMutation({
    mutationFn: (vals: FormValues) => createInstitution(vals),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["institutions"] });
      router.replace("/(admin)/institutions");
    },
    onError: (e) => alertError("Could not create institution", e),
  });

  if (dq.isError) {
    const msg = dq.error instanceof Error ? dq.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Add institution" onBack={() => router.back()} />
        <ErrorScreen message={msg} error={dq.error} onRetry={() => void dq.refetch()} />
      </ScreenWrapper>
    );
  }

  if (dq.isLoading) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Add institution" onBack={() => router.back()} />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList rows={2} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable omitStatusBar>
      <AppHeader title="Add institution" onBack={() => router.back()} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing["5xl"] }}
      >
        <Text style={styles.hint}>Institutions must exist before creating demand notices.</Text>
        <AppPicker
          label="District"
          options={districtOpts}
          value={form.watch("districtId")}
          onChange={(v) => form.setValue("districtId", v)}
          error={form.formState.errors.districtId?.message}
        />
        <Controller
          control={form.control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <AppTextInput label="Institution name" value={value} onChangeText={onChange} error={form.formState.errors.name?.message} />
          )}
        />
        <AppPicker
          label="Category"
          options={categoryOptions}
          value={form.watch("category")}
          onChange={(v) => form.setValue("category", v)}
        />
        <Controller
          control={form.control}
          name="address"
          render={({ field: { onChange, value } }) => (
            <AppTextInput label="Address" value={value} onChangeText={onChange} error={form.formState.errors.address?.message} multiline />
          )}
        />
        <Controller
          control={form.control}
          name="contactName"
          render={({ field: { onChange, value } }) => (
            <AppTextInput label="Contact name" value={value} onChangeText={onChange} error={form.formState.errors.contactName?.message} />
          )}
        />
        <Controller
          control={form.control}
          name="contactPhone"
          render={({ field: { onChange, value } }) => (
            <AppTextInput
              label="Contact phone"
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
              error={form.formState.errors.contactPhone?.message}
            />
          )}
        />
        <AppButton
          label="Save institution"
          fullWidth
          loading={mut.isPending}
          onPress={() => void form.handleSubmit((v) => mut.mutate(v))()}
          style={{ marginTop: Spacing.lg }}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
});
