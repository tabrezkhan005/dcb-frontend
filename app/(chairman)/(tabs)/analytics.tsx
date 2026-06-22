import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { RecoveryGaugeChart } from "../../../components/charts/RecoveryGaugeChart";
import { TrendLineChart } from "../../../components/charts/TrendLineChart";
import { DistrictBarChart } from "../../../components/charts/DistrictBarChart";
import { PaymentPieChart } from "../../../components/charts/PaymentPieChart";
import { CollectionBarChart } from "../../../components/charts/CollectionBarChart";
import { AppPicker } from "../../../components/forms/AppPicker";
import { QueryKeys } from "../../../constants/queryKeys";
import { getReportsAnalytics } from "../../../services/dcb";
import { financialYearSelectOptions, getCurrentFY } from "../../../utils/formatDate";
import { Colors } from "../../../constants/colors";
import { Typography } from "../../../constants/typography";
import { Spacing, ScreenPadding } from "../../../constants/spacing";
import { Card } from "../../../components/shared/Card";
import { AmountText } from "../../../components/shared/AmountText";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";

export default function ChairmanAnalyticsScreen() {
  const fyOptions = useMemo(() => financialYearSelectOptions(6), []);
  const [fy, setFy] = useState(() => getCurrentFY());

  const aq = useQuery({
    queryKey: QueryKeys.REPORTS_ANALYTICS({ financialYear: fy }),
    queryFn: () => getReportsAnalytics(fy),
    enabled: fy.length > 0,
  });

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

  const barData = (aq.data?.monthlyTrend ?? []).map((m) => ({
    month: m.month,
    collected: Number.parseFloat(m.collected),
    target: Number.parseFloat(m.demanded),
  }));

  const recovery = useMemo(() => {
    let d = 0;
    let c = 0;
    for (const row of aq.data?.districtComparison ?? []) {
      d += Number.parseFloat(row.demanded);
      c += Number.parseFloat(row.collected);
    }
    if (d <= 0) {
      return 0;
    }
    return Math.round((c / d) * 100);
  }, [aq.data?.districtComparison]);

  if (aq.isError) {
    const msg = aq.error instanceof Error ? aq.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Analytics" />
        <ErrorScreen message={msg} error={aq.error} onRetry={() => void aq.refetch()} />
      </ScreenWrapper>
    );
  }

  if (aq.isLoading && aq.data === undefined) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Analytics" />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList rows={2} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      scrollable
      omitStatusBar
      refreshControl={
        <RefreshControl refreshing={aq.isFetching} onRefresh={() => void aq.refetch()} />
      }
    >
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={{ marginHorizontal: -ScreenPadding, marginTop: -Spacing.lg }}
      >
        <AppHeader title="Analytics" subtitle="State performance" />
      </LinearGradient>

      <View style={{ marginTop: Spacing.md }}>
        <AppPicker label="Financial year" options={fyOptions} value={fy} onChange={setFy} />
      </View>

      <Text style={styles.h}>Recovery (FY {fy})</Text>
      <RecoveryGaugeChart percentage={recovery} label="Weighted recovery across scoped districts" />

      <Text style={styles.h}>Monthly collected vs demand</Text>
      <CollectionBarChart data={barData} title="Collections vs demand by month" />

      <Text style={styles.h}>Collection trend</Text>
      <TrendLineChart data={trend} title={`Net collections — FY ${fy}`} />

      <Text style={styles.h}>District comparison</Text>
      <DistrictBarChart data={districts} title="Demanded vs collected by district" />

      <Text style={styles.h}>Payment modes</Text>
      <PaymentPieChart data={payModes} />

      <Text style={styles.h}>Top inspectors</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
        {(aq.data?.topInspectors ?? []).map((row) => (
          <Card key={row.inspectorId} style={styles.topCard}>
            <Text style={styles.topName}>{row.name}</Text>
            <AmountText amount={row.amount} size="md" />
          </Card>
        ))}
      </ScrollView>

      <Text style={styles.h}>Overdue institutions</Text>
      {(aq.data?.overdueInstitutions ?? []).map((row) => (
        <Card key={row.demandId} style={styles.overdue}>
          <Text style={styles.odName}>{row.institutionName}</Text>
          <AmountText amount={row.balance} size="sm" />
          <Text style={styles.odSub}>{row.daysOverdue} days overdue</Text>
        </Card>
      ))}
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
