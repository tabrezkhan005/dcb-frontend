import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { ProfileScreen } from "../../../components/profile/ProfileScreen";
import { RoleEnum } from "../../../constants/roles";
import { Card } from "../../../components/shared/Card";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";
import { QueryKeys } from "../../../constants/queryKeys";
import { listCollections, listDemands } from "../../../services/dcb";
import { useAuthStore } from "../../../stores/authStore";

function InspectorStatsCard() {
  const userId = useAuthStore((s) => s.user?.id);
  const colQ = useQuery({
    queryKey: QueryKeys.COLLECTIONS({}),
    queryFn: () => listCollections({}),
    enabled: userId !== undefined,
  });
  const demQ = useQuery({
    queryKey: QueryKeys.DEMANDS({}),
    queryFn: () => listDemands({}),
    enabled: userId !== undefined,
  });

  const { collected, countAccepted, pendingDemands } = useMemo(() => {
    const rows = colQ.data ?? [];
    let sum = 0;
    let n = 0;
    for (const c of rows) {
      if (c.status === "ACCEPTED" && c.inspectorId === userId) {
        sum += Number.parseFloat(c.amountCollected);
        n += 1;
      }
    }
    const mine = (demQ.data ?? []).filter((d) => d.inspectorId === userId);
    const pending = mine.filter((d) => d.status === "PENDING" || d.status === "OVERDUE").length;
    return { collected: sum, countAccepted: n, pendingDemands: pending };
  }, [colQ.data, demQ.data, userId]);

  const loading = colQ.isLoading || demQ.isLoading;

  return (
    <Card style={{ marginBottom: Spacing.lg, padding: Spacing.lg }}>
      <Text style={styles.k}>Collections accepted</Text>
      <Text style={styles.v}>{loading ? "…" : String(countAccepted)}</Text>
      <Text style={styles.k}>Amount collected (accepted)</Text>
      <Text style={styles.v}>{loading ? "…" : collected.toLocaleString("en-IN")}</Text>
      <Text style={styles.k}>Demands pending / overdue</Text>
      <Text style={styles.v}>{loading ? "…" : String(pendingDemands)}</Text>
    </Card>
  );
}

export default function InspectorProfileRoute() {
  return <ProfileScreen role={RoleEnum.INSPECTOR} statsSlot={<InspectorStatsCard />} />;
}

const styles = StyleSheet.create({
  k: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  v: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
});
