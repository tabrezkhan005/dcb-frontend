import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Sharing from "expo-sharing";
import { File as ExpoFSFile, Paths } from "expo-file-system";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { Card } from "../../../components/shared/Card";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import { AmountText } from "../../../components/shared/AmountText";
import { EmptyState } from "../../../components/shared/EmptyState";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { BottomSheet } from "../../../components/shared/BottomSheet";
import { AppButton } from "../../../components/forms/AppButton";
import { QueryKeys } from "../../../constants/queryKeys";
import { Colors } from "../../../constants/colors";
import { Typography } from "../../../constants/typography";
import { Spacing } from "../../../constants/spacing";
import { getCollectionReceiptUrl, listCollections } from "../../../services/dcb";
import type { Collection } from "../../../types/api.types";
import { formatDateTime } from "../../../utils/formatDate";

export default function InspectorReceiptsScreen() {
  const [pick, setPick] = useState<Collection | null>(null);
  const q = useQuery({
    queryKey: QueryKeys.COLLECTIONS({}),
    queryFn: () => listCollections({}),
  });

  const onRefresh = useCallback(() => {
    void q.refetch();
  }, [q]);

  const downloadMut = useMutation({
    mutationFn: (collectionId: string) => getCollectionReceiptUrl(collectionId),
    onSuccess: async (res) => {
      const dest = new ExpoFSFile(
        Paths.cache,
        `receipt-${res.receiptNumber ?? Date.now()}.txt`,
      );
      const out = await ExpoFSFile.downloadFileAsync(res.downloadUrl, dest, {
        idempotent: true,
      });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(out.uri);
        return;
      }
      await Linking.openURL(res.downloadUrl);
    },
    onError: (e) => {
      Alert.alert("Receipt", e instanceof Error ? e.message : "Could not download receipt");
    },
  });

  if (q.isError) {
    const msg = q.error instanceof Error ? q.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="My Receipts" />
        <ErrorScreen message={msg} error={q.error} onRetry={() => void q.refetch()} />
      </ScreenWrapper>
    );
  }

  if (q.isLoading) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="My Receipts" />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList />
        </View>
      </ScreenWrapper>
    );
  }

  const rows = q.data ?? [];
  const totalAmt = rows.reduce((s, c) => s + Number.parseFloat(c.amountCollected), 0);
  const pending = rows.filter((c) => c.status === "SUBMITTED").length;
  const accepted = rows.filter((c) => c.status === "ACCEPTED").length;

  return (
    <ScreenWrapper omitStatusBar>
      <AppHeader title="My Receipts" />
      <FlatList
        data={rows}
        keyExtractor={(i) => i.id}
        style={{ flex: 1, paddingHorizontal: Spacing.lg }}
        refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.stats}>
            <View style={styles.statChip}>
              <Text style={styles.statLbl}>Total</Text>
              <Text style={styles.statVal}>{rows.length}</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statLbl}>Amount</Text>
              <AmountText amount={String(totalAmt)} size="sm" />
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statLbl}>Pending</Text>
              <Text style={[styles.statVal, { color: Colors.warning }]}>{pending}</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statLbl}>Accepted</Text>
              <Text style={[styles.statVal, { color: Colors.success }]}>{accepted}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState title="No receipts yet" subtitle="Your submitted collections appear here." />
        }
        contentContainerStyle={
          rows.length === 0 ? { flexGrow: 1 } : { paddingBottom: Spacing["3xl"] }
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => setPick(item)}>
            <Card style={styles.card}>
              <Text style={styles.rcpt}>{item.receiptNumber ?? "Pending assignment"}</Text>
              <Text style={styles.inst}>{item.demand?.institution?.name ?? "—"}</Text>
              <AmountText amount={item.amountCollected} size="lg" />
              <View style={styles.row}>
                <Text style={styles.meta}>{item.paymentMode}</Text>
                <StatusBadge status={item.status} size="sm" />
              </View>
              <Text style={styles.meta}>{formatDateTime(item.submittedAt)}</Text>
            </Card>
          </Pressable>
        )}
      />
      <BottomSheet visible={pick !== null} onClose={() => setPick(null)} title="Receipt">
        {pick !== null ? (
          <View style={{ gap: Spacing.sm }}>
            <Text style={styles.rcpt}>{pick.receiptNumber ?? "Pending"}</Text>
            <AmountText amount={pick.amountCollected} size="lg" />
            <StatusBadge status={pick.status} size="sm" />
            <Text style={styles.meta}>{formatDateTime(pick.submittedAt)}</Text>
            {pick.status === "ACCEPTED" && pick.receiptNumber !== null ? (
              <AppButton
                label="Download receipt"
                onPress={() => downloadMut.mutate(pick.id)}
                loading={downloadMut.isPending}
                fullWidth
                style={{ marginTop: Spacing.md }}
              />
            ) : null}
          </View>
        ) : null}
      </BottomSheet>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.md },
  statChip: {
    flexGrow: 1,
    minWidth: "22%",
    backgroundColor: Colors.surface2,
    padding: Spacing.sm,
    borderRadius: 8,
  },
  statLbl: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  statVal: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.primary },
  card: { marginBottom: Spacing.md },
  rcpt: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  inst: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: Spacing.sm },
  meta: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: Spacing.xs },
});
