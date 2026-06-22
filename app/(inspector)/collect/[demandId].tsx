import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import * as Crypto from "expo-crypto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { Card } from "../../../components/shared/Card";
import { AppTextInput } from "../../../components/forms/AppTextInput";
import { AppButton } from "../../../components/forms/AppButton";
import { AmountText } from "../../../components/shared/AmountText";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";
import { QueryKeys } from "../../../constants/queryKeys";
import { Colors } from "../../../constants/colors";
import { Typography } from "../../../constants/typography";
import { Spacing } from "../../../constants/spacing";
import { getDemand, submitCollection } from "../../../services/dcb";
import type { PaymentMode } from "../../../types/api.types";
import { formatDate } from "../../../utils/formatDate";
import { parseAmount } from "../../../utils/formatCurrency";

const modes: { mode: PaymentMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: "CASH", label: "Cash", icon: "cash-outline" },
  { mode: "CHEQUE", label: "Cheque", icon: "business-outline" },
  { mode: "UPI", label: "UPI", icon: "phone-portrait-outline" },
  { mode: "DD", label: "DD", icon: "document-text-outline" },
];

const schema = z
  .object({
    amount: z.string().min(1, "Enter amount"),
    paymentMode: z.enum(["CASH", "CHEQUE", "UPI", "DD"]),
    referenceNo: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMode !== "CASH") {
      if (data.referenceNo === undefined || data.referenceNo.trim().length < 3) {
        ctx.addIssue({
          code: "custom",
          message: "Reference is required",
          path: ["referenceNo"],
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

export default function CollectScreen() {
  const { demandId } = useLocalSearchParams<{ demandId: string }>();
  const qc = useQueryClient();
  const [offline, setOffline] = useState(false);
  const [done, setDone] = useState<{ receipt?: string | null; amount: string; inst: string } | null>(
    null,
  );

  const q = useQuery({
    queryKey: QueryKeys.DEMANDS({ id: demandId }),
    queryFn: () => getDemand(String(demandId)),
    enabled: demandId !== undefined,
  });

  useEffect(() => {
    const sub = NetInfo.addEventListener((s) => {
      setOffline(s.isConnected === false);
    });
    return () => sub();
  }, []);

  const collected = useMemo(() => {
    if (q.data === undefined) {
      return 0;
    }
    return (q.data.collections ?? [])
      .filter((c) => c.status === "ACCEPTED")
      .reduce((s, c) => s + Number.parseFloat(c.amountCollected), 0);
  }, [q.data]);

  const due = q.data !== undefined ? Number.parseFloat(q.data.amountDue) : 0;
  const remaining = Math.max(0, due - collected);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: "",
      paymentMode: "CASH",
      referenceNo: "",
    },
  });

  const mut = useMutation({
    mutationFn: async (vals: FormValues) => {
      const amt = parseAmount(vals.amount);
      if (amt <= 0) {
        throw new Error("Invalid amount");
      }
      if (amt > remaining) {
        throw new Error("Amount exceeds remaining balance");
      }
      const idem = Crypto.randomUUID();
      return submitCollection({
        demandId: String(demandId),
        amountCollected: amt,
        paymentMode: vals.paymentMode,
        referenceNo:
          vals.paymentMode === "CASH"
            ? undefined
            : vals.referenceNo?.trim() || undefined,
        idempotencyKey: idem,
      });
    },
    onSuccess: (row) => {
      void qc.invalidateQueries({ queryKey: ["demands"] });
      setDone({
        receipt: row.receiptNumber,
        amount: row.amountCollected,
        inst: row.demand?.institution?.name ?? "",
      });
    },
  });

  if (q.isError) {
    const msg = q.error instanceof Error ? q.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Record Collection" onBack={() => router.back()} />
        <ErrorScreen message={msg} error={q.error} onRetry={() => void q.refetch()} />
      </ScreenWrapper>
    );
  }

  if (q.isLoading || q.data === undefined) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Record Collection" onBack={() => router.back()} />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList />
        </View>
      </ScreenWrapper>
    );
  }

  if (done !== null) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Record Collection" onBack={() => router.replace("/(inspector)/(tabs)/demands")} />
        <View style={styles.success}>
          <Ionicons name="checkmark-circle" size={72} color={Colors.success} />
          <Text style={styles.successTitle}>Collection Submitted!</Text>
          <Text style={styles.successSub}>
            {done.receipt !== null && done.receipt !== undefined && done.receipt.length > 0
              ? `Receipt ${done.receipt}`
              : "Pending verification"}
          </Text>
          <AmountText amount={done.amount} size="xl" />
          <Text style={styles.successSub}>{done.inst}</Text>
          <AppButton
            label="Back to Demands"
            fullWidth
            onPress={() => router.replace("/(inspector)/(tabs)/demands")}
            style={{ marginTop: Spacing.xl }}
          />
        </View>
      </ScreenWrapper>
    );
  }

  const d = q.data;
  const refLabel =
    form.watch("paymentMode") === "CHEQUE"
      ? "Cheque Number"
      : form.watch("paymentMode") === "UPI"
        ? "UPI Reference"
        : form.watch("paymentMode") === "DD"
          ? "DD Number"
          : "";

  return (
    <ScreenWrapper omitStatusBar>
      <AppHeader title="Record Collection" onBack={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          {offline ? (
            <View style={styles.offline}>
              <Text style={styles.offlineTxt}>
                No connection — submit when you are back online.
              </Text>
            </View>
          ) : null}

          <Card style={styles.card}>
            <Text style={styles.h1}>{d.institution?.name ?? "—"}</Text>
            <View style={styles.row}>
              <Text style={styles.rowLbl}>Amount Due: </Text>
              <AmountText amount={d.amountDue} size="md" />
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLbl}>Already Collected: </Text>
              <AmountText amount={String(collected)} size="md" />
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLbl}>Remaining: </Text>
              <AmountText
                amount={String(remaining)}
                size="lg"
                color={remaining < due * 0.1 ? Colors.warning : Colors.primary}
              />
            </View>
          </Card>

          <Text style={styles.label}>Amount collected</Text>
          <Controller
            control={form.control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <AppTextInput
                label=" "
                keyboardType="decimal-pad"
                value={value}
                onChangeText={onChange}
                error={form.formState.errors.amount?.message}
                hint={`Remaining ${remaining.toFixed(2)}`}
              />
            )}
          />

          <Text style={styles.label}>Payment mode</Text>
          <Controller
            control={form.control}
            name="paymentMode"
            render={({ field: { onChange, value } }) => (
              <View style={styles.grid}>
                {modes.map((m) => {
                  const sel = value === m.mode;
                  return (
                    <Pressable
                      key={m.mode}
                      onPress={() => onChange(m.mode)}
                      style={[styles.modeBtn, sel ? styles.modeOn : styles.modeOff]}
                    >
                      <Ionicons
                        name={m.icon}
                        size={22}
                        color={sel ? Colors.textOnDark : Colors.primary}
                      />
                      <Text style={[styles.modeLbl, sel ? styles.modeLblOn : styles.modeLblOff]}>
                        {m.label}
                      </Text>
                      {sel ? (
                        <Ionicons name="checkmark-circle" size={18} color={Colors.textOnDark} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            )}
          />

          {form.watch("paymentMode") !== "CASH" ? (
            <Controller
              control={form.control}
              name="referenceNo"
              render={({ field: { onChange, value } }) => (
                <AppTextInput
                  label={refLabel}
                  value={value}
                  onChangeText={onChange}
                  error={form.formState.errors.referenceNo?.message}
                />
              )}
            />
          ) : null}

          <AppTextInput
            label="Date of collection"
            value={formatDate(new Date())}
            editable={false}
          />

          {mut.isError ? (
            <Text style={styles.err}>
              {mut.error instanceof Error ? mut.error.message : "Submit failed"}
            </Text>
          ) : null}

          <AppButton
            label={mut.isPending ? "Submitting…" : "Submit Collection"}
            fullWidth
            size="lg"
            loading={mut.isPending}
            onPress={() => {
              void form.handleSubmit((vals) => mut.mutate(vals))();
            }}
            style={{ marginTop: Spacing.lg, marginBottom: Spacing["3xl"] }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, paddingBottom: Spacing["5xl"] },
  offline: {
    backgroundColor: Colors.status.pending.bgLight,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  offlineTxt: { color: Colors.status.pending.text, fontSize: Typography.sizes.sm },
  card: { marginBottom: Spacing.lg },
  h1: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  row: { marginTop: Spacing.xs, flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  rowLbl: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  modeBtn: {
    width: "47%",
    minHeight: 72,
    borderRadius: 10,
    borderWidth: 1,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  modeOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  modeOff: { backgroundColor: Colors.surface, borderColor: Colors.border },
  modeLbl: { flex: 1, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  modeLblOn: { color: Colors.textOnDark },
  modeLblOff: { color: Colors.primary },
  err: { color: Colors.danger, marginBottom: Spacing.md },
  success: { flex: 1, padding: Spacing.xl, alignItems: "center", justifyContent: "center" },
  successTitle: {
    marginTop: Spacing.lg,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  successSub: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
