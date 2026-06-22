import { useMemo, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { Card } from "../../../components/shared/Card";
import { AppButton } from "../../../components/forms/AppButton";
import { KPICard } from "../../../components/shared/KPICard";
import { AmountText } from "../../../components/shared/AmountText";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import { BottomSheet } from "../../../components/shared/BottomSheet";
import { AppPicker } from "../../../components/forms/AppPicker";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";
import { SkeletonList } from "../../../components/shared/SkeletonLoader";
import { QueryKeys } from "../../../constants/queryKeys";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";
import {
  deactivateUser,
  getUser,
  getUserActivity,
  listCollections,
  listDemands,
  listDistricts,
  resetUserDevice,
  transferInspector,
  updateUser,
} from "../../../services/dcb";
import { formatDateTime, getCurrentFY } from "../../../utils/formatDate";
import { alertError } from "../../../utils/errors";
import { Ionicons } from "@expo/vector-icons";

export default function AdminInspectorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const uid = String(id);
  const qc = useQueryClient();
  const [transferOpen, setTransferOpen] = useState(false);
  const [toDistrict, setToDistrict] = useState("");

  const uq = useQuery({
    queryKey: QueryKeys.USERS({ id: uid }),
    queryFn: () => getUser(uid),
    enabled: uid.length > 0,
  });

  const aq = useQuery({
    queryKey: ["userActivity", uid],
    queryFn: () => getUserActivity(uid),
    enabled: uid.length > 0,
  });

  const cq = useQuery({
    queryKey: QueryKeys.COLLECTIONS({ inspectorId: uid }),
    queryFn: () => listCollections({ inspectorId: uid }),
    enabled: uid.length > 0,
  });

  const dq = useQuery({
    queryKey: QueryKeys.DEMANDS({}),
    queryFn: () => listDemands({}),
    enabled: uid.length > 0,
  });

  const distQ = useQuery({
    queryKey: QueryKeys.DISTRICTS,
    queryFn: listDistricts,
    enabled: transferOpen,
  });

  const fy = getCurrentFY();
  const myDemands = useMemo(
    () => (dq.data ?? []).filter((d) => d.inspectorId === uid),
    [dq.data, uid],
  );
  const pendingCount = useMemo(
    () => myDemands.filter((d) => d.status === "PENDING" || d.status === "OVERDUE").length,
    [myDemands],
  );

  const fyStats = useMemo(() => {
    let collected = 0;
    let assigned = 0;
    for (const d of myDemands) {
      if (d.financialYear === fy) {
        assigned += 1;
      }
    }
    for (const c of cq.data ?? []) {
      if (c.status !== "ACCEPTED") {
        continue;
      }
      const dfy = c.demand?.financialYear;
      if (dfy === fy) {
        collected += Number.parseFloat(c.amountCollected);
      }
    }
    return { collected, assigned };
  }, [myDemands, cq.data, fy]);

  const activeMut = useMutation({
    mutationFn: (isActive: boolean) => updateUser(uid, { isActive }),
    onSuccess: (data) => {
      qc.setQueryData(QueryKeys.USERS({ id: uid }), data);
    },
    onError: (e) => alertError("Update failed", e),
  });

  const transferMut = useMutation({
    mutationFn: () => transferInspector(uid, toDistrict, "Admin transfer"),
    onSuccess: () => {
      setTransferOpen(false);
      void qc.invalidateQueries({ queryKey: ["users"] });
      void qc.invalidateQueries({ queryKey: ["demands"] });
      router.back();
    },
    onError: (e) => alertError("Transfer failed", e),
  });

  const deactivateMut = useMutation({
    mutationFn: () => deactivateUser(uid),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["users"] });
      router.back();
    },
    onError: (e) => alertError("Deactivate failed", e),
  });

  const resetDeviceMut = useMutation({
    mutationFn: () => resetUserDevice(uid),
    onSuccess: () => {
      Alert.alert(
        "Device reset",
        "The inspector can sign in from a new phone on next login.",
      );
    },
    onError: (e) => alertError("Reset failed", e),
  });

  const onRefresh = () => {
    void uq.refetch();
    void aq.refetch();
    void cq.refetch();
    void dq.refetch();
  };

  if (uq.isError) {
    const msg = uq.error instanceof Error ? uq.error.message : "Error";
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Inspector" onBack={() => router.back()} />
        <ErrorScreen message={msg} error={uq.error} onRetry={() => void uq.refetch()} />
      </ScreenWrapper>
    );
  }

  if (uq.isLoading || uq.data === undefined) {
    return (
      <ScreenWrapper omitStatusBar>
        <AppHeader title="Inspector" onBack={() => router.back()} />
        <View style={{ padding: Spacing.lg }}>
          <SkeletonList />
        </View>
      </ScreenWrapper>
    );
  }

  const u = uq.data;
  const transferOpts =
    distQ.data
      ?.filter((d) => d.id !== u.districtId)
      .map((d) => ({ label: `${d.name} (${d.code})`, value: d.id })) ?? [];

  return (
    <ScreenWrapper scrollable omitStatusBar>
      <AppHeader title={u.name} onBack={() => router.back()} />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={uq.isFetching || cq.isFetching || dq.isFetching}
            onRefresh={onRefresh}
          />
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: Spacing["5xl"] }}
      >
        <Card style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>
              {u.name
                .split(/\s+/)
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{u.name}</Text>
          <Text style={styles.meta}>{u.phone}</Text>
          <Text style={styles.meta}>{u.email ?? ""}</Text>
          <Text style={styles.meta}>{u.district?.name ?? "District"}</Text>
          <View style={styles.row}>
            <Text style={styles.meta}>Active</Text>
            <Switch
              value={u.isActive !== false}
              onValueChange={(v) => activeMut.mutate(v)}
              trackColor={{ false: Colors.border, true: Colors.accentLight }}
              thumbColor={Colors.surface}
            />
          </View>
        </Card>

        <Text style={styles.sec}>This FY performance</Text>
        <View style={styles.kpiRow}>
          <KPICard
            label="Demands assigned"
            value={String(fyStats.assigned)}
            color={Colors.primary}
            icon={<Ionicons name="document-text-outline" size={20} color={Colors.primary} />}
          />
          <KPICard
            label="Collected (accepted)"
            value={String(fyStats.collected)}
            color={Colors.accent}
            icon={<Ionicons name="cash-outline" size={20} color={Colors.accent} />}
          />
          <KPICard
            label="Pending demands"
            value={String(pendingCount)}
            color={Colors.warning}
            icon={<Ionicons name="alert-circle-outline" size={20} color={Colors.warning} />}
          />
        </View>

        <Text style={styles.sec}>Recent collections</Text>
        {(cq.data ?? []).length === 0 ? (
          <Text style={styles.meta}>No collections recorded yet.</Text>
        ) : null}
        {(cq.data ?? []).slice(0, 5).map((c) => (
          <Card key={c.id} style={styles.mini}>
            <AmountText amount={c.amountCollected} size="md" />
            <StatusBadge status={c.status} size="sm" />
            <Text style={styles.meta}>{formatDateTime(c.submittedAt)}</Text>
          </Card>
        ))}

        <AppButton
          label="Transfer to District"
          variant="secondary"
          fullWidth
          onPress={() => setTransferOpen(true)}
          style={{ marginTop: Spacing.lg }}
        />

        <Text style={styles.sec}>Login activity</Text>
        {(aq.data ?? []).length === 0 ? (
          <Text style={styles.meta}>No audit activity logged yet.</Text>
        ) : null}
        {(aq.data ?? []).map((row) => (
          <Card key={row.id} style={styles.mini}>
            <Text style={styles.bold}>{row.action}</Text>
            <Text style={styles.meta}>
              {row.entityType} #{row.entityId}
            </Text>
            <Text style={styles.meta}>{formatDateTime(row.createdAt)}</Text>
            {row.ipAddress !== null ? (
              <Text style={styles.meta}>{row.ipAddress}</Text>
            ) : null}
          </Card>
        ))}

        <AppButton
          label="Reset registered device"
          variant="secondary"
          fullWidth
          onPress={() => {
            Alert.alert(
              "Reset device",
              "Allow this inspector to sign in from a new phone?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Reset", onPress: () => resetDeviceMut.mutate() },
              ],
            );
          }}
          loading={resetDeviceMut.isPending}
          style={{ marginTop: Spacing.xl }}
        />

        <AppButton
          label="Deactivate Inspector"
          variant="danger"
          fullWidth
          onPress={() => {
            Alert.alert(
              "Deactivate",
              "This will deactivate the inspector account.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Deactivate", style: "destructive", onPress: () => deactivateMut.mutate() },
              ],
            );
          }}
          loading={deactivateMut.isPending}
          style={{ marginTop: Spacing["2xl"] }}
        />
      </ScrollView>

      <BottomSheet visible={transferOpen} onClose={() => setTransferOpen(false)} title="Transfer inspector">
        <Text style={styles.warn}>
          All {pendingCount} pending demand(s) will move with reassignment rules on the server.
        </Text>
        <AppPicker label="New district" options={transferOpts} value={toDistrict} onChange={setToDistrict} />
        <AppButton
          label="Confirm Transfer"
          onPress={() => {
            if (toDistrict.length > 0) {
              transferMut.mutate();
            }
          }}
          loading={transferMut.isPending}
        />
        <AppButton label="Cancel" variant="ghost" onPress={() => setTransferOpen(false)} />
      </BottomSheet>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.xl, marginBottom: Spacing.lg, alignItems: "center" },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  avatarTxt: { color: Colors.textOnDark, fontSize: 24, fontWeight: Typography.weights.bold },
  name: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  meta: { marginTop: Spacing.xs, fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: Spacing.lg,
  },
  sec: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
    color: Colors.textPrimary,
  },
  kpiRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md, marginBottom: Spacing.lg },
  mini: { padding: Spacing.md, marginBottom: Spacing.sm },
  bold: { fontWeight: Typography.weights.semibold, color: Colors.textPrimary },
  warn: { color: Colors.warning, marginBottom: Spacing.md, fontSize: Typography.sizes.sm },
});
