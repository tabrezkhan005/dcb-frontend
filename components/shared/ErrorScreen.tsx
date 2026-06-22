import { StyleSheet, Text, View } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";
import { AppButton } from "../forms/AppButton";
import { isNetworkLikeError } from "../../utils/isNetworkError";

interface ErrorScreenProps {
  message: string;
  /** Original error from TanStack Query / fetch — used to detect transport failures when the device still reports "online". */
  error?: unknown;
  onRetry?: () => void;
  /** Use inside scroll parents (e.g. FlatList empty) — avoids flex:1 swallowing layout. */
  compact?: boolean;
}

export function ErrorScreen({ message, error, onRetry, compact = false }: ErrorScreenProps) {
  const net = useNetInfo();
  const deviceOffline =
    net.isConnected === false ||
    (net.isConnected === true && net.isInternetReachable === false);
  const transportFail = isNetworkLikeError(error);
  const asOffline = deviceOffline || transportFail;

  const title = asOffline ? "No connection" : "Something went wrong";
  const body = asOffline
    ? "Check your signal or Wi‑Fi, then try again. Anything you already opened may still appear from cache while offline."
    : message;

  return (
    <View style={[styles.wrap, compact ? styles.wrapInline : null]}>
      <Ionicons
        name={asOffline ? "cloud-offline-outline" : "alert-circle-outline"}
        size={40}
        color={asOffline ? Colors.warning : Colors.danger}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.msg}>{body}</Text>
      {onRetry !== undefined ? (
        <AppButton label="Retry" onPress={onRetry} style={styles.btn} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
    backgroundColor: Colors.background,
  },
  wrapInline: {
    flex: 0,
    flexGrow: 1,
    minHeight: 220,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  msg: {
    marginTop: Spacing.sm,
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.45,
  },
  btn: { marginTop: Spacing.lg, minWidth: 140 },
});
