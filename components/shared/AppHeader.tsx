import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";
import { AppStatusBar } from "./StatusBar";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  leftIcon?: ReactNode;
  rightAction?: ReactNode;
  badgeCount?: number;
}

export function AppHeader({
  title,
  subtitle,
  onBack,
  leftIcon,
  rightAction,
  badgeCount,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <AppStatusBar variant="dark" />
      <View style={styles.row}>
        <View style={styles.side}>
          {onBack !== undefined ? (
            <Pressable
              onPress={onBack}
              hitSlop={12}
              style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.textOnDark} />
            </Pressable>
          ) : (
            leftIcon ?? <View style={styles.iconPlaceholder} />
          )}
        </View>
        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle !== undefined ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={[styles.side, styles.right]}>
          {rightAction}
          {badgeCount !== undefined && badgeCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {badgeCount > 99 ? "99+" : String(badgeCount)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const HEADER_BODY = 56;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.sm,
  },
  row: {
    minHeight: HEADER_BODY,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  side: { width: 48, justifyContent: "center" },
  right: { alignItems: "flex-end" },
  center: { flex: 1, alignItems: "center" },
  title: {
    color: Colors.textOnDark,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.sizes.md * 1.2,
  },
  subtitle: {
    color: Colors.textOnDark,
    opacity: 0.85,
    fontSize: Typography.sizes.sm,
    marginTop: 2,
  },
  iconBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
  },
  iconPlaceholder: { width: 24, height: 24 },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 18,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  badgeText: {
    color: Colors.textOnDark,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
});
