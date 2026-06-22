import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useIsFetching, useIsRestoring } from "@tanstack/react-query";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";

/**
 * Subtle strip when stale queries refetch in the background (cached UI stays visible).
 * Hidden during persisted-cache restore and on first cold fetch (no cached data yet).
 */
export function BackgroundFetchIndicator() {
  const restoring = useIsRestoring();
  const backgroundCount = useIsFetching({
    predicate: (q) =>
      q.state.fetchStatus === "fetching" && q.state.data !== undefined,
  });

  if (restoring || backgroundCount === 0) {
    return null;
  }

  return (
    <View style={styles.bar} accessibilityRole="progressbar" accessibilityLabel="Updating content">
      <ActivityIndicator size="small" color={Colors.primary} style={styles.spin} />
      <Text style={styles.txt}>Updating…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface2,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  spin: { marginRight: Spacing.sm },
  txt: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
});
