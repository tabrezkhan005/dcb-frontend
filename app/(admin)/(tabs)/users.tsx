import { FlatList, Pressable, RefreshControl, StyleSheet, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { Card } from "../../../components/shared/Card";
import { QueryListShell } from "../../../components/shared/QueryListShell";
import { QueryKeys } from "../../../constants/queryKeys";
import { RoleDisplayNames, RoleEnum } from "../../../constants/roles";
import { listUsers } from "../../../services/dcb";
import type { User } from "../../../types/api.types";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";
import { FloatingActionButton } from "../../../components/shared/FloatingActionButton";

function openUser(item: User): void {
  if (item.role === RoleEnum.INSPECTOR) {
    router.push(`/(admin)/inspectors/${item.id}`);
    return;
  }
  router.push(`/(admin)/users/${item.id}`);
}

export default function AdminUsersScreen() {
  const q = useQuery({
    queryKey: QueryKeys.USERS({}),
    queryFn: () => listUsers({}),
  });

  return (
    <ScreenWrapper omitStatusBar>
      <QueryListShell
        query={q}
        emptyTitle="No users"
        emptySubtitle="Add district staff and inspectors from the button below."
        header={<AppHeader title="Users" />}
      >
        {(rows) => (
          <FlatList
            data={rows}
            keyExtractor={(i) => i.id}
            style={{ flex: 1, paddingHorizontal: Spacing.lg }}
            refreshControl={
              <RefreshControl refreshing={q.isFetching} onRefresh={() => void q.refetch()} />
            }
            renderItem={({ item }) => (
              <Pressable onPress={() => openUser(item)}>
                <Card style={styles.card}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>
                    {RoleDisplayNames[item.role] ?? item.role} · {item.phone ?? "—"}
                  </Text>
                  <Text style={styles.district}>{item.district?.name ?? ""}</Text>
                </Card>
              </Pressable>
            )}
          />
        )}
      </QueryListShell>
      <FloatingActionButton icon="person-add-outline" onPress={() => router.push("/(admin)/users/create")} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md, padding: Spacing.lg },
  name: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  meta: { marginTop: Spacing.xs, fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  district: { marginTop: Spacing.xs, fontSize: Typography.sizes.xs, color: Colors.textMuted },
});
