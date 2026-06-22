import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { AmountText } from "../../../components/shared/AmountText";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import { InfoRow } from "../../../components/shared/InfoRow";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { AppButton } from "../../../components/forms/AppButton";
import { AppTextInput } from "../../../components/forms/AppTextInput";
import { QueryKeys } from "../../../constants/queryKeys";
import { getCollection, acceptCollection, queryCollection } from "../../../services/dcb";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";
import { formatDateTime } from "../../../utils/formatDate";
import { alertError } from "../../../utils/errors";

export default function AccountsCollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const q = useQuery({
    queryKey: QueryKeys.COLLECTIONS({ id }),
    queryFn: () => getCollection(String(id)),
    enabled: id !== undefined,
  });

  const acceptMut = useMutation({
    mutationFn: () => acceptCollection(String(id)),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["collections"] }),
    onError: (e) => alertError("Accept failed", e),
  });

  const queryMut = useMutation({
    mutationFn: () => queryCollection(String(id), note.trim()),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["collections"] });
      setNote("");
    },
    onError: (e) => alertError("Query failed", e),
  });

  if (q.isError) {
    const msg = q.error instanceof Error ? q.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Collection" onBack={() => router.back()} />
        <ErrorScreen message={msg} error={q.error} onRetry={() => void q.refetch()} />
      </ScreenWrapper>
    );
  }

  if (q.isLoading || q.data === undefined) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Collection" onBack={() => router.back()} />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList />
        </View>
      </ScreenWrapper>
    );
  }

  const c = q.data;
  const inst = c.demand?.institution;

  return (
    <ScreenWrapper scrollable omitStatusBar>
      <AppHeader title="Collection Detail" onBack={() => router.back()} />
      <View style={styles.hero}>
        <AmountText amount={c.amountCollected} size="xl" />
        <Text style={styles.mode}>{c.paymentMode}</Text>
        <StatusBadge status={c.status} size="md" />
      </View>
      <View style={styles.block}>
        <InfoRow label="Institution" value={inst?.name ?? "—"} />
        <InfoRow label="Inspector" value={c.inspector?.name ?? "—"} />
        <InfoRow label="Submitted" value={formatDateTime(c.submittedAt)} />
        {c.receiptNumber !== null ? (
          <InfoRow label="Receipt" value={c.receiptNumber} />
        ) : null}
        {c.referenceNo !== null && c.referenceNo.length > 0 ? (
          <InfoRow label="Reference" value={c.referenceNo} />
        ) : null}
        {c.accountsNote !== null && c.accountsNote.length > 0 ? (
          <InfoRow label="Accounts note" value={c.accountsNote} />
        ) : null}
      </View>
      {c.status === "SUBMITTED" ? (
        <View style={{ gap: Spacing.md }}>
          <AppButton
            label="Accept Collection"
            onPress={() => acceptMut.mutate()}
            loading={acceptMut.isPending}
          />
          <AppTextInput label="Query note (min 10 characters)" value={note} onChangeText={setNote} multiline />
          <AppButton
            label="Raise Query"
            variant="secondary"
            onPress={() => queryMut.mutate()}
            loading={queryMut.isPending}
            disabled={note.trim().length < 10}
          />
        </View>
      ) : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", padding: Spacing.xl, gap: Spacing.sm },
  mode: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  block: { marginBottom: Spacing.xl },
});
