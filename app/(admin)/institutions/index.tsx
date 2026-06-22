import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { FloatingActionButton } from "../../../components/shared/FloatingActionButton";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { Card } from "../../../components/shared/Card";
import { SearchBar } from "../../../components/shared/SearchBar";
import { EmptyState } from "../../../components/shared/EmptyState";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";
import { QueryKeys } from "../../../constants/queryKeys";
import { listInstitutions } from "../../../services/dcb";
import type { Institution } from "../../../types/api.types";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";

export default function AdminInstitutionsScreen() {
  const [search, setSearch] = useState("");
  const q = useQuery({
    queryKey: QueryKeys.INSTITUTIONS({ search }),
    queryFn: () => listInstitutions({ search: search.length > 0 ? search : undefined }),
  });

  const onRefresh = useCallback(() => {
    void q.refetch();
  }, [q]);

  if (q.isError && q.data === undefined) {
    const msg = q.error instanceof Error ? q.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Institutions" />
        <ErrorScreen message={msg} error={q.error} onRetry={() => void q.refetch()} />
      </ScreenWrapper>
    );
  }

  if (q.isLoading && q.data === undefined) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Institutions" />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList />
        </View>
      </ScreenWrapper>
    );
  }

  const rows = q.data ?? [];

  const renderItem = ({ item }: { item: Institution }) => (
    <Pressable onPress={() => router.push(`/(admin)/institutions/${item.id}`)}>
      <Card style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>{item.category}</Text>
        <Text style={styles.meta}>
          {item.isActive === false ? "Inactive" : "Active"} · {item.contactPhone}
        </Text>
      </Card>
    </Pressable>
  );

  return (
    <ScreenWrapper omitStatusBar>
      <AppHeader title="Institutions" />
      <View style={styles.search}>
        <SearchBar placeholder="Search institution" onSearch={setSearch} />
      </View>
      <FlatList
        data={rows}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={onRefresh} />}
        contentContainerStyle={
          rows.length === 0 ? { flexGrow: 1, padding: Spacing.lg } : { padding: Spacing.lg, paddingBottom: Spacing["5xl"] }
        }
        ListEmptyComponent={
          <EmptyState
            title="No institutions"
            subtitle="Add waqf institutions so demands can be raised against them."
          />
        }
      />
      <FloatingActionButton
        icon="add"
        onPress={() => router.push("/(admin)/institutions/create")}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  search: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  card: { marginBottom: Spacing.md },
  name: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  meta: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: Spacing.xs },
});
