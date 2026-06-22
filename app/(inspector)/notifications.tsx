import { useCallback, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../../components/shared/AppHeader";
import { ScreenWrapper } from "../../components/shared/ScreenWrapper";
import { Card } from "../../components/shared/Card";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";
import { useNotificationStore } from "../../stores/notificationStore";

function parseLastPayload(raw: string | null): Record<string, unknown> | null {
  if (raw === null || raw.length === 0) {
    return null;
  }
  try {
    const j = JSON.parse(raw) as unknown;
    return typeof j === "object" && j !== null && !Array.isArray(j)
      ? (j as Record<string, unknown>)
      : { data: j as unknown };
  } catch {
    return { raw };
  }
}

export default function InspectorNotificationsScreen() {
  const unread = useNotificationStore((s) => s.unreadCount);
  const lastRaw = useNotificationStore((s) => s.lastNotification);
  const reset = useNotificationStore((s) => s.resetUnread);

  useFocusEffect(
    useCallback(() => {
      reset();
    }, [reset]),
  );

  const parsed = useMemo(() => parseLastPayload(lastRaw), [lastRaw]);

  return (
    <ScreenWrapper scrollable omitStatusBar>
      <AppHeader title="Notifications" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing["3xl"] }}>
        <Card style={styles.card}>
          <Text style={styles.lead}>
            In-app alerts appear when the server sends a push (for example, collection updates). Allow notifications
            in system settings for the best experience.
          </Text>
          <Text style={styles.meta}>Opening this screen clears the unread badge. Last count: {unread}</Text>
        </Card>

        <Text style={styles.h}>Last payload</Text>
        <Card style={styles.card}>
          {parsed === null ? (
            <Text style={styles.muted}>No notification received yet on this device.</Text>
          ) : (
            Object.entries(parsed).map(([k, v]) => (
              <Text key={k} style={styles.kv}>
                <Text style={styles.k}>{k}: </Text>
                {typeof v === "string" ? v : JSON.stringify(v)}
              </Text>
            ))
          )}
        </Card>

        <Pressable style={styles.hint} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={Colors.primary} />
          <Text style={styles.hintTxt}>Back to home</Text>
        </Pressable>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.lg, marginBottom: Spacing.lg },
  lead: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  meta: { marginTop: Spacing.md, fontSize: Typography.sizes.xs, color: Colors.textMuted },
  h: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
    color: Colors.textPrimary,
  },
  muted: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  kv: { fontSize: Typography.sizes.sm, color: Colors.textPrimary, marginBottom: Spacing.xs },
  k: { fontWeight: Typography.weights.semibold, color: Colors.textSecondary },
  hint: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginTop: Spacing.lg },
  hintTxt: { color: Colors.primary, fontWeight: Typography.weights.medium },
});
