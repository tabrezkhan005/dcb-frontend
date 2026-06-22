import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";
import type { CollectionStatus, DemandStatus } from "../../types/api.types";

type Status = DemandStatus | CollectionStatus;

const config: Record<
  string,
  { label: string; icon: React.ComponentProps<typeof Ionicons>["name"]; bg: string; fg: string }
> = {
  PENDING: {
    label: "Pending",
    icon: "time-outline",
    bg: Colors.status.pending.bgLight,
    fg: Colors.status.pending.text,
  },
  SUBMITTED: {
    label: "Submitted",
    icon: "send-outline",
    bg: Colors.status.submitted.bgLight,
    fg: Colors.status.submitted.text,
  },
  ACCEPTED: {
    label: "Accepted",
    icon: "checkmark-circle-outline",
    bg: Colors.status.accepted.bgLight,
    fg: Colors.status.accepted.text,
  },
  QUERIED: {
    label: "Queried",
    icon: "alert-circle-outline",
    bg: Colors.status.queried.bgLight,
    fg: Colors.status.queried.text,
  },
  OVERDUE: {
    label: "Overdue",
    icon: "warning-outline",
    bg: Colors.status.overdue.bgLight,
    fg: Colors.status.overdue.text,
  },
  COLLECTED: {
    label: "Collected",
    icon: "checkmark-done-circle-outline",
    bg: Colors.status.collected.bgLight,
    fg: Colors.status.collected.text,
  },
  PARTIAL: {
    label: "Partial",
    icon: "analytics-outline",
    bg: Colors.status.partial.bgLight,
    fg: Colors.status.partial.text,
  },
};

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const c = config[status] ?? config.PENDING;
  const fs = size === "sm" ? Typography.sizes.xs : Typography.sizes.sm;
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon} size={fs + 2} color={c.fg} />
      <Text style={[styles.txt, { color: c.fg, fontSize: fs }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  txt: {
    fontWeight: Typography.weights.medium,
  },
});
