import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { DataTable } from "../../../components/shared/DataTable";
import { AppPicker } from "../../../components/forms/AppPicker";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";
import { EmptyState } from "../../../components/shared/EmptyState";
import { QueryKeys } from "../../../constants/queryKeys";
import { getReportsDcb } from "../../../services/dcb";
import { financialYearSelectOptions, getCurrentFY } from "../../../utils/formatDate";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";
import { formatAmount } from "../../../utils/formatCurrency";

export default function AccountsRegisterScreen() {
  const fyOptions = useMemo(() => financialYearSelectOptions(6), []);
  const [fy, setFy] = useState(() => getCurrentFY());

  const q = useQuery({
    queryKey: QueryKeys.REPORTS_DCB({ financialYear: fy }),
    queryFn: () => getReportsDcb({ financialYear: fy }),
  });

  const rows = q.data ?? [];
  const totals = useMemo(() => {
    let d = 0;
    let c = 0;
    let b = 0;
    for (const r of rows) {
      d += Number.parseFloat(r.demandAmount);
      c += Number.parseFloat(r.totalCollected);
      b += Number.parseFloat(r.balance);
    }
    return { d, c, b };
  }, [rows]);

  if (q.isError && q.data === undefined) {
    const msg = q.error instanceof Error ? q.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="DCB Register" />
        <ErrorScreen message={msg} error={q.error} onRetry={() => void q.refetch()} />
      </ScreenWrapper>
    );
  }

  if (q.isLoading && q.data === undefined) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="DCB Register" />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList rows={3} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper omitStatusBar>
      <AppHeader title="DCB Register" />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={() => void q.refetch()} />}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing["4xl"] }}
      >
        <AppPicker label="Financial Year" options={fyOptions} value={fy} onChange={setFy} />
        <View style={styles.sum}>
          <Text style={styles.sumLbl}>Demanded</Text>
          <Text style={styles.sumVal}>{formatAmount(totals.d)}</Text>
          <Text style={styles.sumLbl}>Collected</Text>
          <Text style={styles.sumVal}>{formatAmount(totals.c)}</Text>
          <Text style={styles.sumLbl}>Balance</Text>
          <Text style={[styles.sumVal, { color: Colors.danger }]}>{formatAmount(totals.b)}</Text>
        </View>
        {rows.length === 0 ? (
          <EmptyState
            title="No register rows"
            subtitle="Demand and collection data for this financial year will appear here."
          />
        ) : (
          <DataTable
            columns={[
              { key: "institutionName", label: "Institution", width: 160, align: "left" },
              { key: "demandAmount", label: "Demand", width: 100, align: "right" },
              { key: "totalCollected", label: "Collected", width: 100, align: "right" },
              { key: "balance", label: "Balance", width: 100, align: "right" },
              { key: "status", label: "Status", width: 100, align: "center" },
            ]}
            data={rows.map((r) => ({
              institutionName: r.institutionName,
              demandAmount: formatAmount(r.demandAmount),
              totalCollected: formatAmount(r.totalCollected),
              balance: formatAmount(r.balance),
              status: r.status,
            }))}
          />
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  sum: { marginBottom: Spacing.lg, gap: Spacing.xs },
  sumLbl: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  sumVal: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.primary },
});
