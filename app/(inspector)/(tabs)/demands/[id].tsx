import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../../components/shared/ScreenWrapper";
import { StatusBadge } from "../../../../components/shared/StatusBadge";
import { InfoRow } from "../../../../components/shared/InfoRow";
import { Card } from "../../../../components/shared/Card";
import { AppButton } from "../../../../components/forms/AppButton";
import { AmountText } from "../../../../components/shared/AmountText";
import { SkeletonList } from "../../../../components/shared/SkeletonLoader";
import { ErrorScreen } from "../../../../components/shared/ErrorScreen";
import { QueryKeys } from "../../../../constants/queryKeys";
import { Colors } from "../../../../constants/colors";
import { Typography } from "../../../../constants/typography";
import { Spacing } from "../../../../constants/spacing";
import { getDemand } from "../../../../services/dcb";
import type { DemandStatus } from "../../../../types/api.types";
import { formatDate, formatDateTime } from "../../../../utils/formatDate";
import { EmptyState } from "../../../../components/shared/EmptyState";

function statusBannerBg(s: DemandStatus): string {
  switch (s) {
    case "PENDING":
      return Colors.status.pending.bgLight;
    case "PARTIAL":
      return Colors.status.partial.bgLight;
    case "COLLECTED":
      return Colors.status.collected.bgLight;
    case "OVERDUE":
      return Colors.status.overdue.bgLight;
    default:
      return Colors.surface2;
  }
}

export default function InspectorDemandDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const q = useQuery({
    queryKey: QueryKeys.DEMANDS({ id }),
    queryFn: () => getDemand(String(id)),
    enabled: id !== undefined,
  });

  if (q.isError) {
    const msg = q.error instanceof Error ? q.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Demand Details" onBack={() => router.back()} />
        <ErrorScreen message={msg} error={q.error} onRetry={() => void q.refetch()} />
      </ScreenWrapper>
    );
  }

  if (q.isLoading || q.data === undefined) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Demand Details" onBack={() => router.back()} />
        <View style={styles.pad}>
          <SkeletonList />
        </View>
      </ScreenWrapper>
    );
  }

  const d = q.data;
  const collected = (d.collections ?? [])
    .filter((c) => c.status === "ACCEPTED")
    .reduce((s, c) => s + Number.parseFloat(c.amountCollected), 0);
  const due = Number.parseFloat(d.amountDue);
  const banner = statusBannerBg(d.status);

  return (
    <ScreenWrapper scrollable omitStatusBar>
      <AppHeader title="Demand Details" onBack={() => router.back()} />
        <View style={[styles.banner, { backgroundColor: banner }]}>
          <StatusBadge status={d.status} size="md" />
          <View style={styles.bannerAmt}>
            <View>
              <Text style={styles.lbl}>Due</Text>
              <AmountText amount={String(due)} size="lg" />
            </View>
            <View>
              <Text style={styles.lbl}>Collected</Text>
              <AmountText amount={String(collected)} size="lg" />
            </View>
          </View>
        </View>

        <Card style={styles.card}>
          <Text style={styles.h1}>{d.institution?.name ?? "—"}</Text>
          <View style={styles.chip}>
            <Text style={styles.chipTxt}>{d.institution?.category ?? "—"}</Text>
          </View>
          <View style={styles.addrRow}>
            <Ionicons name="location-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.addr}>{d.institution?.address ?? "—"}</Text>
          </View>
          <Pressable
            style={styles.addrRow}
            onPress={() => {
              const ph = d.institution?.contactPhone;
              if (ph !== undefined) {
                void Linking.openURL(`tel:${ph}`);
              }
            }}
          >
            <Ionicons name="call-outline" size={18} color={Colors.primary} />
            <Text style={styles.phone}>
              {d.institution?.contactName ?? ""} · {d.institution?.contactPhone ?? "—"}
            </Text>
          </Pressable>
        </Card>

        <Card style={styles.card}>
          <InfoRow label="Financial Year" value={d.financialYear} />
          <InfoRow label="Due Date" value={formatDate(d.dueDate)} />
          <InfoRow label="Created" value={formatDateTime(d.createdAt)} />
          <InfoRow label="Assigned" value={formatDateTime(d.updatedAt)} />
          <View style={styles.progBg}>
            <View
              style={[
                styles.progFill,
                { width: `${due > 0 ? Math.min(100, Math.round((collected / due) * 100)) : 0}%` },
              ]}
            />
          </View>
        </Card>

        <Text style={styles.sec}>Collection history</Text>
        {(d.collections ?? []).length === 0 ? (
          <EmptyState
            title="No collections"
            subtitle="Payments recorded against this demand will show here."
          />
        ) : null}
        {(d.collections ?? []).map((c) => (
          <Card key={c.id} style={styles.card}>
            <View style={styles.hRow}>
              <AmountText amount={c.amountCollected} size="md" />
              <StatusBadge status={c.status} size="sm" />
            </View>
            <Text style={styles.meta}>{c.paymentMode}</Text>
            <Text style={styles.meta}>{formatDateTime(c.submittedAt)}</Text>
            {c.receiptNumber !== null ? (
              <Text style={styles.meta}>Receipt {c.receiptNumber}</Text>
            ) : null}
            {c.status === "QUERIED" && c.accountsNote !== null ? (
              <View style={styles.query}>
                <Text style={styles.queryTxt}>{c.accountsNote}</Text>
              </View>
            ) : null}
          </Card>
        ))}

        {d.status === "PENDING" || d.status === "PARTIAL" || d.status === "OVERDUE" ? (
          <AppButton
            label="Record Collection"
            fullWidth
            onPress={() =>
              router.push(`/(inspector)/collect/${d.id}`)
            }
            style={styles.cta}
          />
        ) : null}
        {d.status === "COLLECTED" ? (
          <View style={styles.done}>
            <Text style={styles.doneTxt}>Fully Collected ✓</Text>
          </View>
        ) : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  pad: { padding: Spacing.lg },
  banner: { padding: Spacing.lg, alignItems: "center" },
  bannerAmt: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: Spacing.lg,
  },
  lbl: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  card: { marginBottom: Spacing.md },
  h1: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  chip: {
    alignSelf: "flex-start",
    marginTop: Spacing.sm,
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 9999,
  },
  chipTxt: { fontSize: Typography.sizes.xs, color: Colors.textSecondary },
  addrRow: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.md },
  addr: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  phone: { fontSize: Typography.sizes.sm, color: Colors.primary },
  progBg: {
    height: 10,
    backgroundColor: Colors.surface2,
    borderRadius: 5,
    marginTop: Spacing.md,
    overflow: "hidden",
  },
  progFill: { height: 10, backgroundColor: Colors.accent, borderRadius: 5 },
  sec: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
    color: Colors.textPrimary,
  },
  hRow: { flexDirection: "row", justifyContent: "space-between" },
  meta: { marginTop: Spacing.xs, fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  query: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.status.pending.bgLight,
    borderRadius: 8,
  },
  queryTxt: { color: Colors.status.pending.text, fontSize: Typography.sizes.sm },
  cta: { marginVertical: Spacing.xl },
  done: {
    padding: Spacing.lg,
    backgroundColor: Colors.status.accepted.bgLight,
    borderRadius: 8,
    marginBottom: Spacing["3xl"],
  },
  doneTxt: {
    textAlign: "center",
    color: Colors.status.accepted.text,
    fontWeight: Typography.weights.semibold,
  },
});
