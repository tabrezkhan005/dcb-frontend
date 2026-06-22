import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";
import { AppButton } from "../forms/AppButton";

interface EmptyStateProps {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.art}>
        <View style={styles.circle} />
        <View style={styles.rect} />
        <Ionicons
          name="document-text-outline"
          size={48}
          color={Colors.primaryLight}
          style={styles.icon}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{subtitle}</Text>
      {actionLabel !== undefined && onAction !== undefined ? (
        <AppButton label={actionLabel} onPress={onAction} style={styles.btn} />
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
  },
  art: { width: 120, height: 120, marginBottom: Spacing.xl },
  circle: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface2,
    top: 0,
    left: 20,
  },
  rect: {
    position: "absolute",
    width: 100,
    height: 12,
    backgroundColor: Colors.border,
    bottom: 24,
    left: 10,
    borderRadius: 6,
  },
  icon: { position: "absolute", top: 16, left: 36 },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  sub: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  btn: { marginTop: Spacing.xl, minWidth: 200 },
});
