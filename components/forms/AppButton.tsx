import { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ComponentProps<typeof Ionicons>["name"];
  rightIcon?: React.ComponentProps<typeof Ionicons>["name"];
  style?: ViewStyle;
}

export function AppButton({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
}: AppButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const pad: ViewStyle =
    size === "sm"
      ? { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md }
      : size === "lg"
        ? { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl }
        : { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg };
  const fontSize =
    size === "sm" ? Typography.sizes.sm : size === "lg" ? Typography.sizes.md : Typography.sizes.base;

  const colors = {
    primary: { bg: Colors.primary, fg: Colors.textOnDark, border: Colors.primary },
    secondary: { bg: Colors.surface, fg: Colors.primary, border: Colors.primary },
    danger: { bg: Colors.surface, fg: Colors.danger, border: Colors.danger },
    ghost: { bg: "transparent", fg: Colors.primary, border: "transparent" },
  }[variant];

  const labelStyle: TextStyle = {
    color: colors.fg,
    fontSize,
    fontWeight: Typography.weights.semibold,
  };

  return (
    <Animated.View style={{ transform: [{ scale }], alignSelf: fullWidth ? "stretch" : "center" }}>
      <Pressable
        disabled={disabled || loading}
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start()
        }
        style={[
          styles.base,
          { backgroundColor: colors.bg, borderColor: colors.border },
          pad,
          fullWidth && { alignSelf: "stretch" },
          (disabled || loading) && { opacity: 0.5 },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === "primary" ? Colors.textOnDark : Colors.primary} />
        ) : (
          <>
            {leftIcon !== undefined ? (
              <Ionicons name={leftIcon} size={18} color={colors.fg} style={styles.iconL} />
            ) : null}
            <Text style={labelStyle}>{label}</Text>
            {rightIcon !== undefined ? (
              <Ionicons name={rightIcon} size={18} color={colors.fg} style={styles.iconR} />
            ) : null}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  iconL: { marginRight: Spacing.xs },
  iconR: { marginLeft: Spacing.xs },
});
