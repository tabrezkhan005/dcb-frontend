import { FlatList, Pressable, RefreshControl, StyleSheet, Text } from "react-native";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { Card } from "../../../components/shared/Card";
import { AmountText } from "../../../components/shared/AmountText";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import { QueryListShell } from "../../../components/shared/QueryListShell";
import { QueryKeys } from "../../../constants/queryKeys";
import { listCollections } from "../../../services/dcb";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";

export default function AccountsVerifiedScreen() {
  const q = useQuery({
    queryKey: QueryKeys.COLLECTIONS({}),
    queryFn: () => listCollections({}),
  });

  const filtered = useMemo(
    () => (q.data ?? []).filter((c) => c.status === "ACCEPTED" || c.status === "QUERIED"),
    [q.data],
  );

  return (
    <ScreenWrapper omitStatusBar>
      <QueryListShell
        query={{ ...q, data: q.data === undefined ? undefined : filtered }}
        emptyTitle="No verified collections"
        emptySubtitle="Accepted and queried collections will appear here."
        header={<AppHeader title="Verified Collections" />}
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
              <Pressable onPress={() => router.push(`/(accounts)/collection/${item.id}`)}>
                <Card style={styles.card}>
                  <Text style={styles.rcpt}>{item.receiptNumber ?? "—"}</Text>
                  <Text style={styles.inst}>{item.demand?.institution?.name ?? "—"}</Text>
                  <AmountText amount={item.amountCollected} size="md" />
                  <StatusBadge status={item.status} size="sm" />
                </Card>
              </Pressable>
            )}
          />
        )}
      </QueryListShell>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md, padding: Spacing.lg },
  rcpt: { fontWeight: Typography.weights.bold, fontSize: Typography.sizes.sm },
  inst: { color: Colors.textSecondary, fontSize: Typography.sizes.sm, marginTop: Spacing.xs },
});
