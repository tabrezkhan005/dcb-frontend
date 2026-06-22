import { FlatList, Pressable, RefreshControl, StyleSheet, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { Card } from "../../../components/shared/Card";
import { QueryListShell } from "../../../components/shared/QueryListShell";
import { QueryKeys } from "../../../constants/queryKeys";
import { listUsers } from "../../../services/dcb";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";
import { FloatingActionButton } from "../../../components/shared/FloatingActionButton";

export default function AdminInspectorsScreen() {
  const q = useQuery({
    queryKey: QueryKeys.USERS({ role: "INSPECTOR" }),
    queryFn: () => listUsers({ role: "INSPECTOR" }),
  });

  return (
    <ScreenWrapper omitStatusBar>
      <QueryListShell
        query={q}
        emptyTitle="No inspectors"
        emptySubtitle="Create an inspector user or assign demands once they exist."
        header={<AppHeader title="Inspectors" />}
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
              <Pressable onPress={() => router.push(`/(admin)/inspectors/${item.id}`)}>
                <Card style={styles.card}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.phone}>{item.phone ?? "—"}</Text>
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
  phone: { marginTop: Spacing.xs, fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  district: { marginTop: Spacing.xs, fontSize: Typography.sizes.xs, color: Colors.textMuted },
});
