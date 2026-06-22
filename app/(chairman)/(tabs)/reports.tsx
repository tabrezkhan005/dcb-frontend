import { useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Sharing from "expo-sharing";
import { File as ExpoFSFile, Paths } from "expo-file-system";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { AppButton } from "../../../components/forms/AppButton";
import { Card } from "../../../components/shared/Card";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";
import { QueryKeys } from "../../../constants/queryKeys";
import { getExportStatus, requestExport } from "../../../services/dcb";
import { getCurrentFY } from "../../../utils/formatDate";
import { ErrorScreen } from "../../../components/shared/ErrorScreen";

type ExportType = "dcb" | "collections" | "demands";

export default function ChairmanReportsScreen() {
  const fy = getCurrentFY();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [lastExportType, setLastExportType] = useState<ExportType | null>(null);

  const statusQ = useQuery({
    queryKey: QueryKeys.EXPORTS(activeJobId ?? undefined),
    queryFn: () => getExportStatus(activeJobId!),
    enabled: activeJobId !== null,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === "processing" ? 2000 : false;
    },
  });

  const exportMut = useMutation({
    mutationFn: (type: ExportType) =>
      requestExport({
        type,
        filters: { financialYear: fy },
      }),
    onSuccess: (res, type) => {
      setActiveJobId(res.jobId);
      setLastExportType(type);
    },
    onError: (e) => {
      Alert.alert("Export failed", e instanceof Error ? e.message : "Unknown error");
    },
  });

  const downloadMut = useMutation({
    mutationFn: async () => {
      const url = statusQ.data?.downloadUrl;
      if (url === undefined || url.length === 0 || activeJobId === null) {
        throw new Error("No download URL yet");
      }
      const ext = "csv";
      const dest = new ExpoFSFile(Paths.cache, `dcb-export-${activeJobId}.${ext}`);
      const out = await ExpoFSFile.downloadFileAsync(url, dest, { idempotent: true });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(out.uri);
        return;
      }
      const opened = await Linking.canOpenURL(url);
      if (opened) {
        await Linking.openURL(url);
        return;
      }
      throw new Error("Sharing is not available. Copy the download URL from your server export job.");
    },
    onError: (e) => {
      Alert.alert("Download", e instanceof Error ? e.message : "Could not download");
    },
  });

  const status = statusQ.data?.status;
  const ready = status === "ready" && (statusQ.data?.downloadUrl?.length ?? 0) > 0;

  if (statusQ.isError && activeJobId !== null) {
    const msg = statusQ.error instanceof Error ? statusQ.error.message : "Error";
    return (
      <ScreenWrapper scrollable omitStatusBar>
        <AppHeader title="Reports & Exports" subtitle={`FY ${fy}`} />
        <ErrorScreen
          message={msg}
          error={statusQ.error}
          onRetry={() => void statusQ.refetch()}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable omitStatusBar>
      <AppHeader title="Reports & Exports" subtitle={`FY ${fy}`} />
      <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing["3xl"] }}>
        <Text style={styles.lead}>
          Generate spreadsheet exports for reconciliation and assembly briefings. Processing usually takes a few
          seconds.
        </Text>

        <AppButton
          label="Export DCB register"
          onPress={() => exportMut.mutate("dcb")}
          loading={exportMut.isPending && exportMut.variables === "dcb"}
          disabled={exportMut.isPending}
          fullWidth
          style={styles.btn}
        />
        <AppButton
          label="Export collections log"
          variant="secondary"
          onPress={() => exportMut.mutate("collections")}
          loading={exportMut.isPending && exportMut.variables === "collections"}
          disabled={exportMut.isPending}
          fullWidth
          style={styles.btn}
        />
        <AppButton
          label="Export demands snapshot"
          variant="secondary"
          onPress={() => exportMut.mutate("demands")}
          loading={exportMut.isPending && exportMut.variables === "demands"}
          disabled={exportMut.isPending}
          fullWidth
          style={styles.btn}
        />

        {activeJobId !== null ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Latest job</Text>
            <Text style={styles.meta}>Job ID: {activeJobId}</Text>
            <Text style={styles.meta}>
              Status: {status ?? (statusQ.isFetching ? "checking…" : "—")}
            </Text>
            {status === "failed" ? (
              <Text style={styles.err}>Export failed. Try again or contact support.</Text>
            ) : null}
            {ready ? (
              <AppButton
                label="Download & share"
                onPress={() => downloadMut.mutate()}
                loading={downloadMut.isPending}
                fullWidth
                style={{ marginTop: Spacing.md }}
              />
            ) : null}
          </Card>
        ) : null}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  btn: { marginBottom: Spacing.md },
  card: { marginTop: Spacing.xl, padding: Spacing.lg },
  cardTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  meta: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  err: { marginTop: Spacing.md, color: Colors.danger, fontSize: Typography.sizes.sm },
});
