import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetInfo } from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";

/**
 * Thin, non-blocking strip when the device has no usable data path.
 * Keeps the rest of the tree mounted so cached TanStack Query data can still render.
 */
export function OfflineBanner() {
  const net = useNetInfo();
  const insets = useSafeAreaInsets();

  if (net.isConnected === null) {
    return null;
  }

  const offline =
    net.isConnected === false ||
    (net.isConnected === true && net.isInternetReachable === false);

  if (!offline) {
    return null;
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]} accessibilityRole="alert">
      <View style={styles.bar}>
        <Ionicons name="cloud-offline-outline" size={16} color={Colors.textOnDark} style={styles.icon} />
        <Text style={styles.txt}>Offline — showing cached data where available.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: Colors.warning },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warning,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  icon: { marginRight: Spacing.sm },
  txt: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textOnDark,
  },
});
