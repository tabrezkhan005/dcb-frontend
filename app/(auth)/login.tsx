import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../stores/authStore";
import { getOrCreateDeviceId } from "../../utils/deviceId";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { BorderRadius, Shadows, Spacing } from "../../constants/spacing";
import { RoleEnum } from "../../constants/roles";
import { AppStatusBar } from "../../components/shared/StatusBar";
import { AppTextInput } from "../../components/forms/AppTextInput";
import { AppButton } from "../../components/forms/AppButton";
import { Card } from "../../components/shared/Card";

const schema = z.object({
  phone: z
    .string()
    .min(10, "Enter 10-digit mobile number")
    .max(10, "Enter 10-digit mobile number")
    .regex(/^\d{10}$/, "Digits only"),
  password: z.string().min(6, "At least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

function roleHome(role: string): "/(inspector)/(tabs)" | "/(accounts)/(tabs)" | "/(admin)/(tabs)" | "/(chairman)/(tabs)" {
  switch (role) {
    case RoleEnum.INSPECTOR:
      return "/(inspector)/(tabs)";
    case RoleEnum.ACCOUNTS:
      return "/(accounts)/(tabs)";
    case RoleEnum.ADMIN:
      return "/(admin)/(tabs)";
    case RoleEnum.CHAIRMAN:
      return "/(chairman)/(tabs)";
    default:
      return "/(inspector)/(tabs)";
  }
}

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const busy = useAuthStore((s) => s.isLoading);
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const deviceId = await getOrCreateDeviceId();
      await login({
        phone: values.phone,
        password: values.password,
        deviceId,
      });
      const role = useAuthStore.getState().user?.role;
      if (role !== undefined) {
        router.replace(roleHome(role));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sign in failed";
      setFormError(msg);
    }
  });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppStatusBar variant="light" />
      <View style={styles.page}>
        <View style={styles.top}>
          <View style={styles.emblem}>
            <Text style={styles.emblemTxt}>AP</Text>
          </View>
          <Text style={styles.gov}>Government of Andhra Pradesh</Text>
          <Text style={styles.appTitle}>DCB Collection System</Text>
        </View>

        <Card style={styles.card} padding={Spacing.xl}>
          <Text style={styles.signInTitle}>Sign In</Text>
        <Text style={styles.label}>Mobile number</Text>
          <View style={styles.phoneRow}>
            <Text style={styles.prefix}>+91</Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppTextInput
                  keyboardType="number-pad"
                  maxLength={10}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.phone?.message}
                  style={styles.phoneInput}
                />
              )}
            />
          </View>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Password"
                secureTextEntry={!showPw}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.password?.message}
                rightIcon={
                  <Pressable
                    onPress={() => setShowPw((s) => !s)}
                    hitSlop={8}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name={showPw ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color={Colors.textSecondary}
                    />
                  </Pressable>
                }
              />
            )}
          />
          {formError !== null ? <Text style={styles.formErr}>{formError}</Text> : null}
          <AppButton
            label="Sign In"
            size="lg"
            fullWidth
            loading={busy}
            onPress={() => {
              void onSubmit();
            }}
          />
        </Card>

        <Text style={styles.footer}>DCB AP v1.0 | Powered by AP State Gov</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  page: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: "space-between",
    paddingBottom: Spacing.xl,
  },
  top: {
    flex: 0.32,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: Spacing.lg,
  },
  emblem: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emblemTxt: {
    color: Colors.textOnDark,
    fontSize: Typography.sizes["2xl"],
    fontWeight: Typography.weights.bold,
  },
  gov: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  appTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    textAlign: "center",
  },
  card: {
    ...Shadows.modal,
    borderRadius: BorderRadius.xl,
    flex: 0.48,
    maxHeight: 420,
  },
  signInTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  prefix: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    paddingBottom: Spacing.md,
    minWidth: 40,
  },
  phoneInput: { flex: 1 },
  formErr: {
    color: Colors.danger,
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.md,
  },
  footer: {
    textAlign: "center",
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
});
