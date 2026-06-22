import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { Card } from "../../../components/shared/Card";
import { AppButton } from "../../../components/forms/AppButton";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";
import { InfoRow } from "../../../components/shared/InfoRow";
import { QueryKeys } from "../../../constants/queryKeys";
import { RoleDisplayNames, RoleEnum } from "../../../constants/roles";
import { getUser } from "../../../services/dcb";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";
import { formatDateTime } from "../../../utils/formatDate";

export default function AdminUserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const uid = String(id);

  const q = useQuery({
    queryKey: QueryKeys.USERS({ id: uid }),
    queryFn: () => getUser(uid),
    enabled: uid.length > 0,
  });

  if (q.isError) {
    const msg = q.error instanceof Error ? q.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="User" onBack={() => router.back()} />
        <ErrorScreen message={msg} error={q.error} onRetry={() => void q.refetch()} />
      </ScreenWrapper>
    );
  }

  if (q.isLoading || q.data === undefined) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="User" onBack={() => router.back()} />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList />
        </View>
      </ScreenWrapper>
    );
  }

  const u = q.data;

  return (
    <ScreenWrapper scrollable omitStatusBar>
      <AppHeader title={u.name} onBack={() => router.back()} />
      <Card style={styles.card}>
        <Text style={styles.role}>{RoleDisplayNames[u.role] ?? u.role}</Text>
        <InfoRow label="Phone" value={u.phone ?? "—"} />
        <InfoRow label="Email" value={u.email ?? "—"} />
        <InfoRow label="District" value={u.district?.name ?? u.districtId} />
        <InfoRow label="Account" value={u.isActive === false ? "Inactive" : "Active"} />
        <InfoRow
          label="Last login"
          value={u.lastLoginAt !== null && u.lastLoginAt !== undefined ? formatDateTime(u.lastLoginAt) : "—"}
        />
      </Card>
      {u.role === RoleEnum.INSPECTOR ? (
        <AppButton
          label="Inspector profile & transfer"
          onPress={() => router.push(`/(admin)/inspectors/${u.id}`)}
          fullWidth
        />
      ) : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.lg, marginBottom: Spacing.lg },
  role: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
});
