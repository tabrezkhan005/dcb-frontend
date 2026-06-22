import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { RecoveryGaugeChart } from "../../../components/charts/RecoveryGaugeChart";
import { TrendLineChart } from "../../../components/charts/TrendLineChart";
import { DistrictBarChart } from "../../../components/charts/DistrictBarChart";
import { PaymentPieChart } from "../../../components/charts/PaymentPieChart";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";
import { EmptyState } from "../../../components/shared/EmptyState";
import { QueryKeys } from "../../../constants/queryKeys";
import { getReportsAnalytics, getReportsSummary } from "../../../services/dcb";
import { getCurrentFY } from "../../../utils/formatDate";
import { Colors } from "../../../constants/colors";
import { Typography } from "../../../constants/typography";
import { Spacing, ScreenPadding } from "../../../constants/spacing";
import { Card } from "../../../components/shared/Card";
import { AmountText } from "../../../components/shared/AmountText";

export default function ChairmanDashboardScreen() {
  const fy = getCurrentFY();
  const sq = useQuery({ queryKey: QueryKeys.REPORTS_SUMMARY, queryFn: getReportsSummary });
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

  const trend = (aq.data?.monthlyTrend ?? []).map((m) => ({
    date: m.month,
    amount: Number.parseFloat(m.collected),
  }));

  const districts = (aq.data?.districtComparison ?? []).map((d) => ({
    district: d.districtName,
    collected: Number.parseFloat(d.collected),
    demanded: Number.parseFloat(d.demanded),
  }));

  const payModes = Object.entries(aq.data?.paymentModeBreakdown ?? {}).map(([mode, v]) => ({
    mode,
    amount: Number.parseFloat(v.amount),
    count: v.count,
  }));

  const topInspectors = aq.data?.topInspectors ?? [];
  const overdue = aq.data?.overdueInstitutions ?? [];

  const onRefresh = () => {
    void sq.refetch();
    void aq.refetch();
  };

  if (fatal) {
    const msg = err instanceof Error ? err.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Chairman's Dashboard" subtitle={`FY ${fy}`} />
        <ErrorScreen message={msg} error={err} onRetry={onRefresh} />
      </ScreenWrapper>
    );
  }

  if (loading) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Chairman's Dashboard" subtitle={`FY ${fy}`} />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList rows={4} />
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
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={{ marginHorizontal: -ScreenPadding, marginTop: -Spacing.lg }}
      >
        <AppHeader title="Chairman's Dashboard" subtitle={`FY ${fy}`} />
      </LinearGradient>
      <Text style={styles.h}>State overview</Text>
      <RecoveryGaugeChart
        percentage={recovery}
        label="Andhra Pradesh collection performance"
        loading={sq.isFetching || aq.isFetching}
      />
      <TrendLineChart data={trend} title={`Collection trend — FY ${fy}`} loading={aq.isFetching} />
      <DistrictBarChart data={districts} title="District-wise performance" loading={aq.isFetching} />
      <PaymentPieChart data={payModes} loading={aq.isFetching} />

      <Text style={styles.h}>Top inspectors (FY {fy})</Text>
      {topInspectors.length === 0 ? (
        <EmptyState title="No ranking yet" subtitle="Inspector totals appear once collections are recorded." />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {topInspectors.map((row) => (
            <Card key={row.inspectorId} style={styles.topCard}>
              <Text style={styles.topName}>{row.name}</Text>
              <AmountText amount={row.amount} size="md" />
            </Card>
          ))}
        </ScrollView>
      )}

      <Text style={styles.h}>Overdue institutions</Text>
      {overdue.length === 0 ? (
        <EmptyState title="No overdue institutions" subtitle="All tracked demands are within due dates." />
      ) : (
        overdue.slice(0, 12).map((row) => (
          <Card key={row.demandId} style={styles.overdue}>
            <Text style={styles.odName}>{row.institutionName}</Text>
            <AmountText amount={row.balance} size="sm" />
            <Text style={styles.odSub}>{row.daysOverdue} days overdue</Text>
          </Card>
        ))
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  h: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  hScroll: { gap: Spacing.md, paddingRight: Spacing.lg },
  topCard: { width: 180, padding: Spacing.md },
  topName: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, marginBottom: Spacing.sm },
  overdue: { padding: Spacing.md, marginBottom: Spacing.sm },
  odName: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: Colors.textPrimary },
  odSub: { marginTop: Spacing.xs, fontSize: Typography.sizes.xs, color: Colors.textMuted },
});
