import { useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { Card } from "../../../components/shared/Card";
import { AppTextInput } from "../../../components/forms/AppTextInput";
import { AppPicker } from "../../../components/forms/AppPicker";
import { AppButton } from "../../../components/forms/AppButton";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";
import { QueryKeys } from "../../../constants/queryKeys";
import { getInstitution, listDistricts, updateInstitution } from "../../../services/dcb";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";
import { alertError } from "../../../utils/errors";

const schema = z.object({
  districtId: z.string().uuid(),
  name: z.string().min(2),
  category: z.string().min(2),
  address: z.string().min(5),
  contactName: z.string().min(2),
  contactPhone: z.string().regex(/^\d{10}$/),
});

type FormValues = z.infer<typeof schema>;

export default function AdminInstitutionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const uid = String(id);
  const qc = useQueryClient();

  const iq = useQuery({
    queryKey: QueryKeys.INSTITUTIONS({ id: uid }),
    queryFn: () => getInstitution(uid),
    enabled: uid.length > 0,
  });

  const dq = useQuery({ queryKey: QueryKeys.DISTRICTS, queryFn: listDistricts });
  const districtOpts = useMemo(
    () => (dq.data ?? []).map((d) => ({ label: `${d.name} (${d.code})`, value: d.id })),
    [dq.data],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values:
      iq.data !== undefined
        ? {
            districtId: iq.data.districtId,
            name: iq.data.name,
            category: iq.data.category,
            address: iq.data.address,
            contactName: iq.data.contactName,
            contactPhone: iq.data.contactPhone,
          }
        : undefined,
  });

  const saveMut = useMutation({
    mutationFn: (vals: FormValues) => updateInstitution(uid, vals),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["institutions"] });
      Alert.alert("Saved", "Institution updated.");
    },
    onError: (e) => alertError("Update failed", e),
  });

  const activeMut = useMutation({
    mutationFn: (isActive: boolean) => updateInstitution(uid, { isActive }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["institutions"] }),
    onError: (e) => alertError("Update failed", e),
  });

  if (iq.isError) {
    const msg = iq.error instanceof Error ? iq.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Institution" onBack={() => router.back()} />
        <ErrorScreen message={msg} error={iq.error} onRetry={() => void iq.refetch()} />
      </ScreenWrapper>
    );
  }

  if (iq.isLoading || iq.data === undefined) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Institution" onBack={() => router.back()} />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList rows={2} />
        </View>
      </ScreenWrapper>
    );
  }

  const inst = iq.data;

  return (
    <ScreenWrapper scrollable omitStatusBar>
      <AppHeader title={inst.name} onBack={() => router.back()} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing["5xl"] }}
      >
        <Card style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.lbl}>Active</Text>
            <Switch
              value={inst.isActive !== false}
              onValueChange={(v) => activeMut.mutate(v)}
              disabled={activeMut.isPending}
            />
          </View>
        </Card>
        <AppPicker
          label="District"
          options={districtOpts}
          value={form.watch("districtId")}
          onChange={(v) => form.setValue("districtId", v)}
        />
        <Controller
          control={form.control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <AppTextInput label="Name" value={value} onChangeText={onChange} />
          )}
        />
        <Controller
          control={form.control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <AppTextInput label="Category" value={value} onChangeText={onChange} />
          )}
        />
        <Controller
          control={form.control}
          name="address"
          render={({ field: { onChange, value } }) => (
            <AppTextInput label="Address" value={value} onChangeText={onChange} multiline />
          )}
        />
        <Controller
          control={form.control}
          name="contactName"
          render={({ field: { onChange, value } }) => (
            <AppTextInput label="Contact name" value={value} onChangeText={onChange} />
          )}
        />
        <Controller
          control={form.control}
          name="contactPhone"
          render={({ field: { onChange, value } }) => (
            <AppTextInput label="Contact phone" keyboardType="phone-pad" value={value} onChangeText={onChange} />
          )}
        />
        <AppButton
          label="Save changes"
          fullWidth
          loading={saveMut.isPending}
          onPress={() => void form.handleSubmit((v) => saveMut.mutate(v))()}
          style={{ marginTop: Spacing.lg }}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.lg, marginBottom: Spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lbl: { fontSize: Typography.sizes.md, color: Colors.textPrimary },
});
