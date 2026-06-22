import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { Card } from "../../../components/shared/Card";
import { AppButton } from "../../../components/forms/AppButton";
import { AmountText } from "../../../components/shared/AmountText";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import { EmptyState } from "../../../components/shared/EmptyState";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { BottomSheet } from "../../../components/shared/BottomSheet";
import { AppTextInput } from "../../../components/forms/AppTextInput";
import { QueryKeys } from "../../../constants/queryKeys";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";
import { acceptCollection, listCollections, queryCollection } from "../../../services/dcb";
import type { Collection } from "../../../types/api.types";
import { formatTimeAgo } from "../../../utils/formatDate";
import { router } from "expo-router";
import { alertError } from "../../../utils/errors";

const pendingKey = QueryKeys.COLLECTIONS({ status: "SUBMITTED" });

export default function AccountsPendingScreen() {
  const qc = useQueryClient();
  const [queryId, setQueryId] = useState<string | null>(null);
  const [queryNote, setQueryNote] = useState("");
  const [acceptTarget, setAcceptTarget] = useState<Collection | null>(null);

  const q = useQuery({
    queryKey: pendingKey,
    queryFn: () => listCollections({ status: "SUBMITTED" }),
    refetchInterval: 30_000,
  });

  const acceptMut = useMutation({
    mutationFn: (id: string) => acceptCollection(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: pendingKey });
      const prev = qc.getQueryData<Collection[]>(pendingKey);
      qc.setQueryData<Collection[]>(pendingKey, (old) => (old ?? []).filter((c) => c.id !== id));
      return { prev };
    },
    onSuccess: () => {
      setAcceptTarget(null);
    },
    onError: (err, _id, ctx) => {
      if (ctx?.prev !== undefined) {
        qc.setQueryData(pendingKey, ctx.prev);
      }
      alertError("Accept failed", err);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  const queryMut = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => queryCollection(id, note),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["collections"] });
      setQueryId(null);
      setQueryNote("");
    },
    onError: (e) => alertError("Query failed", e),
  });

  const onRefresh = useCallback(() => {
    void q.refetch();
  }, [q]);

  const queryNoteTrim = queryNote.trim();
  const queryNoteInvalid = queryId !== null && queryNoteTrim.length > 0 && queryNoteTrim.length < 10;

  if (q.isError) {
    const msg = q.error instanceof Error ? q.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Pending Verification" />
        <ErrorScreen message={msg} error={q.error} onRetry={() => void q.refetch()} />
      </ScreenWrapper>
    );
  }

  if (q.isLoading) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Pending Verification" />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList />
        </View>
      </ScreenWrapper>
    );
  }

  const rows = q.data ?? [];

  return (
    <ScreenWrapper omitStatusBar>
      <AppHeader title="Pending Verification" badgeCount={rows.length} />
      <FlatList
        data={rows}
        keyExtractor={(i) => i.id}
        style={{ flex: 1, paddingHorizontal: Spacing.lg }}
        refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            title="All caught up!"
            subtitle="No pending verifications in your queue."
          />
        }
        contentContainerStyle={rows.length === 0 ? { flexGrow: 1 } : { paddingBottom: Spacing["3xl"] }}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.inspector}>
              {item.inspector?.name ?? "Inspector"} · {formatTimeAgo(item.submittedAt)}
            </Text>
            <Text style={styles.inst}>{item.demand?.institution?.name ?? "—"}</Text>
            <AmountText amount={item.amountCollected} size="xl" />
            <StatusBadge status={item.status} size="sm" />
            {item.referenceNo !== null && item.referenceNo.length > 0 ? (
              <Text style={styles.ref}>{item.referenceNo}</Text>
            ) : null}
            <View style={styles.actions}>
              <View style={{ flex: 1 }}>
                <AppButton label="Accept" onPress={() => setAcceptTarget(item)} />
              </View>
              <View style={{ flex: 1 }}>
                <AppButton
                  label="Query"
                  variant="secondary"
                  onPress={() => setQueryId(item.id)}
                />
              </View>
            </View>
            <Pressable onPress={() => router.push(`/(accounts)/collection/${item.id}`)}>
              <Text style={styles.link}>Open detail</Text>
            </Pressable>
          </Card>
        )}
      />

      <BottomSheet
        visible={acceptTarget !== null}
        onClose={() => setAcceptTarget(null)}
        title="Accept collection"
      >
        {acceptTarget !== null ? (
          <>
            <Text style={styles.confirmInst}>{acceptTarget.demand?.institution?.name ?? "—"}</Text>
            <AmountText amount={acceptTarget.amountCollected} size="lg" />
            <Text style={styles.confirmHint}>
              This marks the collection as accepted and updates the demand balance.
            </Text>
            <AppButton
              label="Confirm accept"
              onPress={() => {
                acceptMut.mutate(acceptTarget.id);
              }}
              loading={acceptMut.isPending}
            />
            <AppButton label="Cancel" variant="ghost" onPress={() => setAcceptTarget(null)} />
          </>
        ) : null}
      </BottomSheet>

      <BottomSheet visible={queryId !== null} onClose={() => setQueryId(null)} title="Raise a query">
        <AppTextInput label="Note (min 10 characters)" value={queryNote} onChangeText={setQueryNote} multiline />
        {queryNoteInvalid ? (
          <Text style={styles.noteErr}>Enter at least 10 characters so the inspector can act on your query.</Text>
        ) : null}
        <AppButton
          label="Submit Query"
          disabled={queryNoteTrim.length < 10}
          onPress={() => {
            if (queryId !== null && queryNoteTrim.length >= 10) {
              queryMut.mutate({ id: queryId, note: queryNoteTrim });
            }
          }}
          loading={queryMut.isPending}
        />
      </BottomSheet>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    padding: Spacing.lg,
  },
  inspector: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  inst: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.sm,
  },
  ref: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
  },
  actions: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.lg },
  link: { marginTop: Spacing.md, color: Colors.primary, fontWeight: Typography.weights.medium },
  confirmInst: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  confirmHint: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  noteErr: { color: Colors.danger, fontSize: Typography.sizes.sm, marginBottom: Spacing.md },
});
