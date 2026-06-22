import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../../../components/shared/Card";
import { ProfileScreen } from "../../../components/profile/ProfileScreen";
import { RoleEnum } from "../../../constants/roles";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";
import { QueryKeys } from "../../../constants/queryKeys";
import { getReportsSummary } from "../../../services/dcb";

function ChairmanStatsCard() {
  const sq = useQuery({ queryKey: QueryKeys.REPORTS_SUMMARY, queryFn: getReportsSummary, staleTime: 60_000 });

  const recovery = useMemo(() => {
    if (sq.data === undefined) {
      return null;
    }
    const d = Number.parseFloat(sq.data.totalDemanded);
    const c = Number.parseFloat(sq.data.totalCollected);
    if (!Number.isFinite(d) || d <= 0) {
      return 0;
    }
    return Math.round((c / d) * 100);
  }, [sq.data]);

  const loading = sq.isLoading;

  return (
    <Card style={{ marginBottom: Spacing.lg, padding: Spacing.lg }}>
      <Text style={styles.k}>State recovery</Text>
      <Text style={styles.v}>{loading || recovery === null ? "…" : `${recovery}%`}</Text>
      <Text style={styles.k}>Active inspectors</Text>
      <Text style={styles.v}>{loading ? "…" : String(sq.data?.activeInspectors ?? "—")}</Text>
      <Text style={styles.k}>Today's collection</Text>
      <Text style={styles.v}>{loading ? "…" : (sq.data?.todayCollection ?? "—")}</Text>
    </Card>
  );
}

export default function ChairmanProfileScreen() {
  return <ProfileScreen role={RoleEnum.CHAIRMAN} statsSlot={<ChairmanStatsCard />} />;
}

const styles = StyleSheet.create({
  k: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  v: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: Colors.textPrimary },
});
