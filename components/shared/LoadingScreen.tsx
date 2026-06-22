import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";

interface LoadingScreenProps {
  message?: string;
}

/** Minimal boot shell — small spinner only, no heavy layout. */
export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="small" color={Colors.primary} />
      {message !== undefined ? <Text style={styles.msg}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  msg: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
});
