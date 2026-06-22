import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { KPICard } from "../../../components/shared/KPICard";
import { CollectionBarChart } from "../../../components/charts/CollectionBarChart";
import { RecoveryGaugeChart } from "../../../components/charts/RecoveryGaugeChart";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";
import { QueryKeys } from "../../../constants/queryKeys";
import { getReportsAnalytics, getReportsSummary } from "../../../services/dcb";
import { getCurrentFY } from "../../../utils/formatDate";
import { Spacing } from "../../../constants/spacing";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/colors";

export default function AdminDashboardScreen() {
  const fy = getCurrentFY();
  const sq = useQuery({
    queryKey: QueryKeys.REPORTS_SUMMARY,
    queryFn: getReportsSummary,
  });
  const aq = useQuery({
    queryKey: QueryKeys.REPORTS_ANALYTICS({ financialYear: fy }),
    queryFn: () => getReportsAnalytics(fy),
  });

  const loading = (sq.isLoading && sq.data === undefined) || (aq.isLoading && aq.data === undefined);
  const fatal = (sq.isError && sq.data === undefined) || (aq.isError && aq.data === undefined);
  const err = sq.error ?? aq.error;

  const recovery =
    sq.data !== undefined
      ? Math.round(
          (Number.parseFloat(sq.data.totalCollected) /
            Math.max(1, Number.parseFloat(sq.data.totalDemanded))) *
            100,
        )
      : 0;

  const barData = (aq.data?.monthlyTrend ?? []).map((m) => ({
    month: m.month,
    collected: Number.parseFloat(m.collected),
    target: Number.parseFloat(m.demanded),
  }));

  const onRefresh = () => {
    void sq.refetch();
    void aq.refetch();
  };

  if (fatal) {
    const msg = err instanceof Error ? err.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Admin Dashboard" subtitle="AP State" />
        <ErrorScreen message={msg} error={err} onRetry={onRefresh} />
      </ScreenWrapper>
    );
  }

  if (loading) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Admin Dashboard" subtitle="AP State" />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList rows={3} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      scrollable
      omitStatusBar
      refreshControl={
        <RefreshControl
          refreshing={sq.isFetching || aq.isFetching}
          onRefresh={onRefresh}
        />
      }
    >
      <AppHeader title="Admin Dashboard" subtitle="AP State" />
      <View style={styles.grid}>
        <KPICard
          label="Total demanded FY"
          value={sq.data?.totalDemanded ?? "—"}
          icon={<Ionicons name="stats-chart-outline" size={22} color={Colors.primary} />}
          color={Colors.primary}
        />
        <KPICard
          label="Total collected"
          value={sq.data?.totalCollected ?? "—"}
          icon={<Ionicons name="cash-outline" size={22} color={Colors.accent} />}
          color={Colors.accent}
        />
        <KPICard
          label="Pending verification"
          value={String(sq.data?.totalPending ?? 0)}
          icon={<Ionicons name="hourglass-outline" size={22} color={Colors.warning} />}
          color={Colors.warning}
        />
        <KPICard
          label="Active inspectors"
          value={String(sq.data?.activeInspectors ?? 0)}
          icon={<Ionicons name="people-outline" size={22} color={Colors.primaryLight} />}
          color={Colors.primaryLight}
        />
      </View>
      <RecoveryGaugeChart
        percentage={recovery}
        label={`FY ${fy} overall recovery`}
        loading={sq.isFetching || aq.isFetching}
      />
      <CollectionBarChart
        data={barData}
        title="Monthly collection vs target"
        loading={aq.isFetching}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
});
