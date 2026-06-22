import { StyleSheet, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../../components/shared/Card";
import { ProfileScreen } from "../../components/profile/ProfileScreen";
import { RoleEnum } from "../../constants/roles";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";
import { Colors } from "../../constants/colors";
import { QueryKeys } from "../../constants/queryKeys";
import { listDistricts, listUsers } from "../../services/dcb";

function AdminStatsCard() {
  const uq = useQuery({ queryKey: QueryKeys.USERS({}), queryFn: () => listUsers({}) });
  const dq = useQuery({ queryKey: QueryKeys.DISTRICTS, queryFn: listDistricts });
  const loading = uq.isLoading || dq.isLoading;
  const users = uq.data?.length ?? 0;
  const districts = dq.data?.length ?? 0;

  return (
    <Card style={{ marginBottom: Spacing.lg, padding: Spacing.lg }}>
      <Text style={styles.k}>Registered users</Text>
      <Text style={styles.v}>{loading ? "…" : String(users)}</Text>
      <Text style={styles.k}>Districts</Text>
      <Text style={styles.v}>{loading ? "…" : String(districts)}</Text>
    </Card>
  );
}

export default function AdminProfileScreen() {
  return <ProfileScreen role={RoleEnum.ADMIN} statsSlot={<AdminStatsCard />} />;
}

const styles = StyleSheet.create({
  k: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  v: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: Colors.textPrimary },
});
