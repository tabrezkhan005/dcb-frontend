import { useCallback, useMemo } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../stores/authStore";
import { useNotificationStore } from "../../../stores/notificationStore";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { Card } from "../../../components/shared/Card";
import { KPICard } from "../../../components/shared/KPICard";
import { SectionHeader } from "../../../components/shared/SectionHeader";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { AmountText } from "../../../components/shared/AmountText";
import { QueryKeys } from "../../../constants/queryKeys";
import { Colors } from "../../../constants/colors";
import { Typography } from "../../../constants/typography";
import { Spacing } from "../../../constants/spacing";
import { listCollections, listDemands } from "../../../services/dcb";
import { portfolioRecoveryPercent } from "../../../utils/demandRecovery";
import { EmptyState } from "../../../components/shared/EmptyState";
import { formatTimeAgo, formatDate } from "../../../utils/formatDate";
import { formatAmount } from "../../../utils/formatCurrency";
import { router } from "expo-router";

export default function InspectorHomeScreen() {
  const user = useAuthStore((s) => s.user);
  const unread = useNotificationStore((s) => s.unreadCount);

  const todayKey = useMemo(() => dayjs().format("YYYY-MM-DD"), []);

  const dq = useQuery({
    queryKey: QueryKeys.DEMANDS({}),
    queryFn: () => listDemands({}),
  });
  const cq = useQuery({
    queryKey: QueryKeys.COLLECTIONS({}),
    queryFn: () => listCollections({}),
  });

  const onRefresh = useCallback(() => {
    void dq.refetch();
    void cq.refetch();
  }, [dq, cq]);

  const todayCollections = useMemo(() => {
    const rows = cq.data ?? [];
    return rows.filter((c) => dayjs(c.submittedAt).format("YYYY-MM-DD") === todayKey);
  }, [cq.data, todayKey]);

  const pendingDemands = useMemo(
    () => (dq.data ?? []).filter((d) => d.status === "PENDING" || d.status === "OVERDUE"),
    [dq.data],
  );

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) {
      return "Good Morning";
    }
    if (h < 17) {
      return "Good Afternoon";
    }
    return "Good Evening";
  }, []);

  if (dq.isError || cq.isError) {
    const err = dq.error ?? cq.error;
    const msg = err instanceof Error ? err.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader
          title={`${greeting}, ${user?.name ?? ""}`}
          subtitle="Your district"
          rightAction={
            <Pressable hitSlop={12} onPress={() => router.push("/(inspector)/notifications")}>
              <Ionicons name="notifications-outline" size={22} color={Colors.textOnDark} />
            </Pressable>
          }
          badgeCount={unread}
        />
        <ErrorScreen message={msg} error={err} onRetry={onRefresh} />
      </ScreenWrapper>
    );
  }

  if (dq.isLoading || cq.isLoading) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Home" />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList />
        </View>
      </ScreenWrapper>
    );
  }

  const todayAmount = todayCollections.reduce(
    (s, c) => s + Number.parseFloat(c.amountCollected),
    0,
  );
  const acceptedToday = todayCollections.filter((c) => c.status === "ACCEPTED").length;

  const recoveryPct = portfolioRecoveryPercent(dq.data ?? [], cq.data ?? []);

  const recentCollections = (cq.data ?? []).slice(0, 5);

  return (
    <ScreenWrapper
      scrollable
      omitStatusBar
      refreshControl={
        <RefreshControl refreshing={dq.isFetching || cq.isFetching} onRefresh={onRefresh} />
      }
    >
      <AppHeader
        title={`${greeting}, ${user?.name ?? ""}`}
        subtitle="Andhra Pradesh"
        badgeCount={unread}
        rightAction={
          <Pressable hitSlop={12} onPress={() => router.push("/(inspector)/notifications")}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textOnDark} />
          </Pressable>
        }
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiRow}>
        <KPICard
          label="Today's collections"
          value={String(todayCollections.length)}
          icon={<Ionicons name="today-outline" size={22} color={Colors.accent} />}
          color={Colors.accent}
        />
        <KPICard
          label="Today's amount"
          value={formatAmount(todayAmount)}
          icon={<Ionicons name="cash-outline" size={22} color={Colors.primary} />}
          color={Colors.primary}
        />
        <KPICard
          label="Pending demands"
          value={String(pendingDemands.length)}
          icon={<Ionicons name="hourglass-outline" size={22} color={Colors.warning} />}
          color={Colors.warning}
        />
        <KPICard
          label="Accepted today"
          value={String(acceptedToday)}
          icon={<Ionicons name="checkmark-done-outline" size={22} color={Colors.success} />}
          color={Colors.success}
        />
      </ScrollView>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Recovery progress (FY)</Text>
        <Text style={styles.muted}>District target vs your accepted collections</Text>
        <View style={styles.progBg}>
          <View style={[styles.progFill, { width: `${recoveryPct}%` }]} />
        </View>
      </Card>

      <SectionHeader
        title="Recent collections"
        actionLabel="See all"
        onAction={() => router.push("/(inspector)/(tabs)/receipts")}
      />
      {recentCollections.length === 0 ? (
        <EmptyState
          title="No collections yet"
          subtitle="Submitted collections will appear here after you record a payment."
        />
      ) : null}
      {recentCollections.map((c) => (
        <Card key={c.id} style={styles.mini}>
          <Text style={styles.miniTitle}>
            {c.demand?.institution?.name ?? "Institution"}
          </Text>
          <View style={styles.miniRow}>
            <AmountText amount={c.amountCollected} size="md" />
            <StatusBadge status={c.status} size="sm" />
            <Text style={styles.time}>{formatTimeAgo(c.submittedAt)}</Text>
          </View>
        </Card>
      ))}

      <SectionHeader
        title="Urgent demands"
        actionLabel="View all"
        onAction={() => router.push("/(inspector)/(tabs)/demands")}
      />
      {pendingDemands.length === 0 ? (
        <EmptyState title="No urgent demands" subtitle="You are caught up on pending and overdue notices." />
      ) : null}
      {pendingDemands.slice(0, 3).map((d) => (
        <Card key={d.id} style={styles.mini}>
          <Text style={styles.miniTitle}>{d.institution?.name ?? "—"}</Text>
          <View style={styles.miniRow}>
            <AmountText amount={d.amountDue} size="sm" />
            <Text style={styles.due}>Due {formatDate(d.dueDate)}</Text>
          </View>
          <Pressable
            style={styles.collectBtn}
            onPress={() => router.push(`/(inspector)/collect/${d.id}`)}
          >
            <Text style={styles.collectTxt}>Collect</Text>
          </Pressable>
        </Card>
      ))}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  kpiRow: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.md },
  card: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, padding: Spacing.lg },
  cardTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
  muted: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: Spacing.xs },
  progBg: {
    height: 12,
    backgroundColor: Colors.surface2,
    borderRadius: 6,
    marginTop: Spacing.md,
    overflow: "hidden",
  },
  progFill: { height: 12, backgroundColor: Colors.accent },
  mini: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md },
  miniTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  miniRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  time: { marginLeft: "auto", fontSize: Typography.sizes.xs, color: Colors.textMuted },
  due: { marginLeft: "auto", fontSize: Typography.sizes.xs, color: Colors.textSecondary },
  collectBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  collectTxt: { color: Colors.textOnDark, fontWeight: Typography.weights.semibold },
});
