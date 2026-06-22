import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import dayjs from "dayjs";
import { AppHeader } from "../../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../../components/shared/ScreenWrapper";
import { SearchBar } from "../../../../components/shared/SearchBar";
import { FilterChips } from "../../../../components/shared/FilterChips";
import { Card } from "../../../../components/shared/Card";
import { StatusBadge } from "../../../../components/shared/StatusBadge";
import { EmptyState } from "../../../../components/shared/EmptyState";
import { SkeletonList } from "../../../../components/shared/SkeletonLoader";
import { ErrorScreen } from "../../../../components/shared/ErrorScreen";
import { AmountText } from "../../../../components/shared/AmountText";
import { QueryKeys } from "../../../../constants/queryKeys";
import { Colors } from "../../../../constants/colors";
import { Typography } from "../../../../constants/typography";
import { Spacing } from "../../../../constants/spacing";
import { listDemands } from "../../../../services/dcb";
import type { DemandNotice, DemandStatus } from "../../../../types/api.types";
import { formatDate } from "../../../../utils/formatDate";
import { demandRecoveryPercent } from "../../../../utils/demandRecovery";

const FILTERS: { label: string; value: DemandStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Partial", value: "PARTIAL" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Collected", value: "COLLECTED" },
];

export default function InspectorDemandsListScreen() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DemandStatus | "ALL">("ALL");

  const params = useMemo(() => {
    const p: Record<string, string | undefined> = {};
    if (filter !== "ALL") {
      p.status = filter;
    }
    if (search.trim().length > 0) {
      p.search = search.trim();
    }
    return p;
  }, [filter, search]);

  const q = useQuery({
    queryKey: QueryKeys.DEMANDS(params),
    queryFn: () => listDemands(params),
  });

  const onRefresh = useCallback(() => {
    void q.refetch();
  }, [q]);

  const renderItem = ({ item }: { item: DemandNotice }) => {
    const overdue =
      item.status === "OVERDUE" ||
      (item.status === "PENDING" &&
        dayjs(item.dueDate).isBefore(dayjs(), "day"));
    const due = dayjs(item.dueDate);
    const inst = item.institution?.name ?? "Institution";
    const pct = demandRecoveryPercent(item);

    return (
      <Pressable
        onPress={() => router.push(`/(inspector)/(tabs)/demands/${item.id}`)}
        style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
      >
        <Card style={overdue ? { ...styles.card, ...styles.cardOverdue } : styles.card}>
          <View style={styles.rowTop}>
            <Text style={styles.inst} numberOfLines={2}>
              {inst}
            </Text>
            <StatusBadge status={item.status} size="sm" />
          </View>
          <View style={styles.rowChips}>
            <View style={styles.chip}>
              <Text style={styles.chipTxt}>{item.district?.code ?? "—"}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipTxt}>{item.financialYear}</Text>
            </View>
          </View>
          <View style={styles.rowAmt}>
            <AmountText amount={item.amountDue} size="lg" />
            <Text style={[styles.due, overdue ? styles.dueBad : null]}>
              Due: {formatDate(item.dueDate)}
            </Text>
          </View>
          <View style={styles.progBg}>
            <View style={[styles.progFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.pctTxt}>{pct}% recovered</Text>
        </Card>
      </Pressable>
    );
  };

  if (q.isError) {
    const msg = q.error instanceof Error ? q.error.message : "Failed to load";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="My Demands" />
        <ErrorScreen message={msg} error={q.error} onRetry={() => void q.refetch()} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper omitStatusBar>
      <AppHeader title="My Demands" />
      <SearchBar placeholder="Search institution" onSearch={setSearch} />
      <FilterChips
        options={FILTERS.map((f) => ({ label: f.label, value: f.value }))}
        selected={filter}
        onSelect={(v) => setFilter(v as DemandStatus | "ALL")}
      />
      {q.isLoading ? (
        <View style={styles.pad}>
          <SkeletonList />
        </View>
      ) : (
        <FlatList
          data={q.data ?? []}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={q.isFetching} onRefresh={onRefresh} />
          }
          contentContainerStyle={
            (q.data?.length ?? 0) === 0 ? styles.emptyWrap : styles.list
          }
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          ListEmptyComponent={
            <EmptyState
              title="No demands assigned"
              subtitle="When demands are assigned to you, they will appear here."
            />
          }
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  pad: { padding: Spacing.lg, flex: 1 },
  list: { padding: Spacing.lg, paddingBottom: Spacing["4xl"] },
  emptyWrap: { flexGrow: 1, padding: Spacing.lg },
  card: { marginBottom: Spacing.md },
  cardOverdue: { borderLeftWidth: 4, borderLeftColor: Colors.danger },
  rowTop: { flexDirection: "row", justifyContent: "space-between", gap: Spacing.sm },
  inst: {
    flex: 1,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  rowChips: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.sm },
  chip: {
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 9999,
  },
  chipTxt: { fontSize: Typography.sizes.xs, color: Colors.textSecondary },
  rowAmt: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  due: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  dueBad: { color: Colors.danger, fontWeight: Typography.weights.semibold },
  progBg: {
    height: 8,
    backgroundColor: Colors.surface2,
    borderRadius: 4,
    marginTop: Spacing.sm,
    overflow: "hidden",
  },
  progFill: {
    height: 8,
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  pctTxt: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
});
