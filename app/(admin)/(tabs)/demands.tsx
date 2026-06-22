import { useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { Card } from "../../../components/shared/Card";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import { BottomSheet } from "../../../components/shared/BottomSheet";
import { AppButton } from "../../../components/forms/AppButton";
import { EmptyState } from "../../../components/shared/EmptyState";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";
import { FloatingActionButton } from "../../../components/shared/FloatingActionButton";
import { QueryKeys } from "../../../constants/queryKeys";
import { assignDemand, listDemands, listUsers } from "../../../services/dcb";
import { Spacing } from "../../../constants/spacing";
import { Colors } from "../../../constants/colors";
import { Typography } from "../../../constants/typography";
import type { DemandNotice } from "../../../types/api.types";
import { alertError } from "../../../utils/errors";

export default function AdminDemandsScreen() {
  const qc = useQueryClient();
  const [assignCtx, setAssignCtx] = useState<{
    demandId: string;
    districtId: string;
    title: string;
  } | null>(null);

  const q = useQuery({
    queryKey: QueryKeys.DEMANDS({}),
    queryFn: () => listDemands({}),
  });

  const inspectorsQ = useQuery({
    queryKey: QueryKeys.USERS({
      role: "INSPECTOR",
      districtId: assignCtx?.districtId,
    }),
    queryFn: () =>
      listUsers({
        role: "INSPECTOR",
        districtId: assignCtx?.districtId,
      }),
    enabled: assignCtx !== null && assignCtx.districtId.length > 0,
  });

  const assignMut = useMutation({
    mutationFn: ({ demandId, inspectorId }: { demandId: string; inspectorId: string }) =>
      assignDemand(demandId, inspectorId),
    onSuccess: () => {
      setAssignCtx(null);
      void qc.invalidateQueries({ queryKey: ["demands"] });
    },
    onError: (e) => alertError("Assign failed", e),
  });

  const openAssign = (item: DemandNotice) => {
    setAssignCtx({
      demandId: item.id,
      districtId: item.districtId,
      title: item.institution?.name ?? "Assign inspector",
    });
  };

  const hasData = q.data !== undefined;
  const rows = q.data ?? [];
  const refreshFailed = q.isError && hasData;
  const fatalListError = q.isError && !hasData;

  if (fatalListError) {
    const msg = q.error instanceof Error ? q.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Demands" />
        <ErrorScreen message={msg} error={q.error} onRetry={() => void q.refetch()} />
        <FloatingActionButton icon="add-outline" onPress={() => router.push("/(admin)/demands/create")} />
      </ScreenWrapper>
    );
  }

  if (q.isLoading && !hasData) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Demands" />
        <View style={{ flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}>
          <SkeletonList rows={2} />
        </View>
        <FloatingActionButton icon="add-outline" onPress={() => router.push("/(admin)/demands/create")} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper omitStatusBar>
      <AppHeader title="Demands" />
      <FlatList
        data={rows}
        keyExtractor={(i) => i.id}
        style={{ flex: 1, paddingHorizontal: Spacing.lg }}
        refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={() => void q.refetch()} />}
        ListHeaderComponent={
          refreshFailed ? (
            <View style={styles.warnBanner}>
              <Text style={styles.warnTxt}>Could not refresh. Pull down to try again.</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState title="No demands" subtitle="Create a demand notice to get started." />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.inst}>{item.institution?.name ?? "—"}</Text>
            <Text style={styles.meta}>FY {item.financialYear}</Text>
            <StatusBadge status={item.status} size="sm" />
            {item.inspectorId === null ? (
              <Pressable onPress={() => openAssign(item)} style={styles.assignLink}>
                <Text style={styles.assignTxt}>Assign inspector</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push(`/(admin)/inspectors/${item.inspectorId}`)}
                style={styles.assignLink}
              >
                <Text style={styles.assignTxt}>View inspector</Text>
              </Pressable>
            )}
          </Card>
        )}
      />
      <FloatingActionButton icon="add-outline" onPress={() => router.push("/(admin)/demands/create")} />

      <BottomSheet
        visible={assignCtx !== null}
        onClose={() => setAssignCtx(null)}
        title={assignCtx?.title ?? "Assign"}
      >
        {inspectorsQ.isLoading ? (
          <Text style={styles.sheetMeta}>Loading inspectors…</Text>
        ) : null}
        {inspectorsQ.isError ? (
          <Text style={styles.err}>
            {inspectorsQ.error instanceof Error ? inspectorsQ.error.message : "Could not load inspectors"}
          </Text>
        ) : null}
        {(inspectorsQ.data ?? []).length === 0 && !inspectorsQ.isLoading && !inspectorsQ.isError ? (
          <Text style={styles.sheetMeta}>No inspectors in this district.</Text>
        ) : null}
        {(inspectorsQ.data ?? []).map((u) => (
          <AppButton
            key={u.id}
            label={u.name}
            variant="secondary"
            fullWidth
            loading={assignMut.isPending}
            onPress={() => assignMut.mutate({ demandId: assignCtx!.demandId, inspectorId: u.id })}
            style={{ marginBottom: Spacing.sm }}
          />
        ))}
        <AppButton label="Cancel" variant="ghost" onPress={() => setAssignCtx(null)} />
      </BottomSheet>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md, padding: Spacing.lg },
  inst: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  meta: { marginTop: Spacing.xs, fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  assignLink: { marginTop: Spacing.md },
  assignTxt: { color: Colors.primary, fontWeight: Typography.weights.semibold, fontSize: Typography.sizes.sm },
  sheetMeta: { color: Colors.textSecondary, marginBottom: Spacing.md, fontSize: Typography.sizes.sm },
  err: { color: Colors.danger, marginBottom: Spacing.md, fontSize: Typography.sizes.sm },
  warnBanner: {
    backgroundColor: Colors.status.pending.bgLight,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  warnTxt: { fontSize: Typography.sizes.xs, color: Colors.status.pending.text, fontWeight: Typography.weights.medium },
});
