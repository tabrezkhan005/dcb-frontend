import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Card } from "../../../components/shared/Card";
import { ProfileScreen } from "../../../components/profile/ProfileScreen";
import { RoleEnum } from "../../../constants/roles";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";
import { QueryKeys } from "../../../constants/queryKeys";
import { listCollections } from "../../../services/dcb";

const pendingKey = QueryKeys.COLLECTIONS({ status: "SUBMITTED" });
const acceptedKey = QueryKeys.COLLECTIONS({ status: "ACCEPTED" });

function AccountsStatsCard() {
  const pendingQ = useQuery({
    queryKey: pendingKey,
    queryFn: () => listCollections({ status: "SUBMITTED" }),
    staleTime: 15_000,
  });
  const acceptedQ = useQuery({
    queryKey: acceptedKey,
    queryFn: () => listCollections({ status: "ACCEPTED" }),
    staleTime: 60_000,
  });

  const verifiedToday = useMemo(() => {
    const start = dayjs().startOf("day");
    return (acceptedQ.data ?? []).filter(
      (c) => c.reviewedAt !== null && dayjs(c.reviewedAt).isSame(start, "day"),
    ).length;
  }, [acceptedQ.data]);

  const loading = pendingQ.isLoading || acceptedQ.isLoading;
  const pending = pendingQ.data?.length ?? 0;

  return (
    <Card style={{ marginBottom: Spacing.lg, padding: Spacing.lg }}>
      <Text style={styles.k}>Verified today</Text>
      <Text style={styles.v}>{loading ? "…" : String(verifiedToday)}</Text>
      <Text style={styles.k}>Pending queue</Text>
      <Text style={styles.v}>{loading ? "…" : String(pending)}</Text>
    </Card>
  );
}

export default function AccountsProfileRoute() {
  return <ProfileScreen role={RoleEnum.ACCOUNTS} statsSlot={<AccountsStatsCard />} />;
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
