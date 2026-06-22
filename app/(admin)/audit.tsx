import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "../../components/shared/AppHeader";
import { ScreenWrapper } from "../../components/shared/ScreenWrapper";
import { Card } from "../../components/shared/Card";
import { EmptyState } from "../../components/shared/EmptyState";
import { ErrorScreen } from "../../components/shared/ErrorScreen";
import { SkeletonList } from "../../components/shared/SkeletonLoader";
import { QueryKeys } from "../../constants/queryKeys";
import { listAuditLogs } from "../../services/dcb";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";
import { Colors } from "../../constants/colors";
import type { AuditLogEntry } from "../../types/api.types";
import { formatDateTime } from "../../utils/formatDate";

export default function AdminAuditScreen() {
  const q = useQuery<AuditLogEntry[]>({
    queryKey: QueryKeys.AUDIT_LOGS,
    queryFn: listAuditLogs,
  });

  if (q.isError) {
    const msg = q.error instanceof Error ? q.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Audit Log" />
        <ErrorScreen message={msg} error={q.error} onRetry={() => void q.refetch()} />
      </ScreenWrapper>
    );
  }

  if (q.isLoading) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Audit Log" />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList rows={2} />
        </View>
      </ScreenWrapper>
    );
  }

  const rows = q.data ?? [];

  return (
    <ScreenWrapper omitStatusBar>
      <AppHeader title="Audit Log" />
      <FlatList
        data={rows}
        keyExtractor={(i) => i.id}
        style={{ flex: 1, paddingHorizontal: Spacing.lg }}
        refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={() => void q.refetch()} />}
        ListEmptyComponent={
          <EmptyState title="No audit entries" subtitle="Actions will appear here as users use the system." />
        }
        contentContainerStyle={rows.length === 0 ? { flexGrow: 1 } : { paddingBottom: Spacing["3xl"] }}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.action}>{item.action}</Text>
            <Text style={styles.meta}>
              {item.user?.name ?? "System"} · {item.entityType} #{item.entityId}
            </Text>
            <Text style={styles.time}>{formatDateTime(item.createdAt)}</Text>
            {item.ipAddress !== null && item.ipAddress.length > 0 ? (
              <Text style={styles.ip}>{item.ipAddress}</Text>
            ) : null}
          </Card>
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md, padding: Spacing.lg },
  action: { fontWeight: Typography.weights.bold, fontSize: Typography.sizes.md, color: Colors.textPrimary },
  meta: { color: Colors.textSecondary, marginTop: Spacing.xs, fontSize: Typography.sizes.sm },
  time: { color: Colors.textMuted, marginTop: Spacing.xs, fontSize: Typography.sizes.xs },
  ip: { color: Colors.textMuted, marginTop: Spacing.xs, fontSize: Typography.sizes.xs },
});
