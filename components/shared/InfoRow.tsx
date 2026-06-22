import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";

interface InfoRowProps {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
  icon?: ReactNode;
}

export function InfoRow({
  label,
  value,
  valueColor = Colors.textPrimary,
  bold = false,
  icon,
}: InfoRowProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text
        style={[
          styles.val,
          { color: valueColor, fontWeight: bold ? Typography.weights.bold : Typography.weights.regular },
        ]}
      >
        {value}
      </Text>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: Spacing.md },
  left: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  label: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  val: {
    fontSize: Typography.sizes.base,
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: Spacing.md,
  },
});
