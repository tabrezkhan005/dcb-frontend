import { useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import * as Crypto from "expo-crypto";
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
import { RoleDisplayNames, RoleEnum } from "../../../constants/roles";
import type { Role } from "../../../types/api.types";
import { createUser, listDistricts } from "../../../services/dcb";

const roles: Role[] = [
  RoleEnum.INSPECTOR,
  RoleEnum.ACCOUNTS,
  RoleEnum.ADMIN,
  RoleEnum.CHAIRMAN,
];

const schema = z
  .object({
    name: z.string().min(2, "Enter full name"),
    phone: z.string().regex(/^\d{10}$/, "10-digit mobile number"),
    email: z.string().optional(),
    role: z.enum(["INSPECTOR", "ACCOUNTS", "ADMIN", "CHAIRMAN"]),
    districtId: z.string().uuid("Select district"),
    password: z.string().min(8, "Min 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
    if (data.email !== undefined && data.email.length > 0) {
      const em = z.string().email().safeParse(data.email);
      if (!em.success) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid email",
          path: ["email"],
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

async function randomPassword(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(12);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#";
  let s = "";
  for (let i = 0; i < 12; i++) {
    s += chars[bytes[i] % chars.length]!;
  }
  return s;
}

export default function AdminCreateUserScreen() {
  const qc = useQueryClient();
  const dq = useQuery({ queryKey: QueryKeys.DISTRICTS, queryFn: listDistricts });
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      role: RoleEnum.INSPECTOR,
      districtId: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mut = useMutation({
    mutationFn: (vals: FormValues) =>
      createUser({
        name: vals.name.trim(),
        phone: vals.phone.trim(),
        email: vals.email?.trim() === "" ? null : vals.email?.trim() ?? null,
        password: vals.password,
        role: vals.role,
        districtId: vals.districtId,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["users"] });
      router.back();
    },
  });

  const roleOpts = useMemo(
    () => roles.map((r) => ({ label: RoleDisplayNames[r], value: r })),
    [],
  );

  const districtOpts =
    dq.data?.map((d) => ({ label: `${d.name} (${d.code})`, value: d.id })) ?? [];

  if (dq.isError) {
    const msg = dq.error instanceof Error ? dq.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Create User" onBack={() => router.back()} />
        <ErrorScreen message={msg} error={dq.error} onRetry={() => void dq.refetch()} />
      </ScreenWrapper>
    );
  }

  if (dq.isLoading) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Create User" onBack={() => router.back()} />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList />
        </View>
      </ScreenWrapper>
    );
  }

  const genPw = async () => {
    const p = await randomPassword();
    form.setValue("password", p);
    form.setValue("confirmPassword", p);
    Alert.alert("Temporary password", p);
  };

  return (
    <ScreenWrapper scrollable omitStatusBar>
      <AppHeader title="Create User" onBack={() => router.back()} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.pad}>
        <Controller
          control={form.control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <AppTextInput label="Full Name" value={value} onChangeText={onChange} error={form.formState.errors.name?.message} />
          )}
        />
        <Controller
          control={form.control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <AppTextInput
              label="Phone (login ID)"
              keyboardType="number-pad"
              maxLength={10}
              value={value}
              onChangeText={onChange}
              error={form.formState.errors.phone?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <AppTextInput
              label="Email (optional)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              error={form.formState.errors.email?.message}
            />
          )}
        />
        <AppPicker
          label="Role"
          options={roleOpts}
          value={form.watch("role")}
          onChange={(v) => form.setValue("role", v as Role)}
          error={form.formState.errors.role?.message}
        />
        <AppPicker
          label="District"
          options={districtOpts}
          value={form.watch("districtId")}
          onChange={(v) => form.setValue("districtId", v)}
          error={form.formState.errors.districtId?.message}
        />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Controller
              control={form.control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <AppTextInput
                  label="Temporary Password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={form.formState.errors.password?.message}
                />
              )}
            />
          </View>
          <AppButton label="Generate" variant="secondary" onPress={() => void genPw()} style={styles.genBtn} />
        </View>
        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <AppTextInput
              label="Confirm Password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={form.formState.errors.confirmPassword?.message}
            />
          )}
        />
        {mut.isError ? (
          <Text style={styles.err}>
            {mut.error instanceof Error ? mut.error.message : "Failed to create user"}
          </Text>
        ) : null}
        <AppButton
          label={mut.isPending ? "Creating…" : "Create User"}
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
  row: { flexDirection: "row", alignItems: "flex-end", gap: Spacing.sm },
  genBtn: { marginBottom: Spacing.lg },
  err: { color: Colors.danger, marginTop: Spacing.md, fontSize: Typography.sizes.sm },
});
