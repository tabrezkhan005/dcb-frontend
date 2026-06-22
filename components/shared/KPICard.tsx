import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { BorderRadius, Shadows, Spacing } from "../../constants/spacing";

interface KPICardProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down";
  trendValue?: string;
  icon?: React.ReactNode;
  color?: string;
}

export function KPICard({
  label,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = Colors.accent,
}: KPICardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translate]);

  return (
    <Animated.View
      style={[
        styles.card,
        Shadows.card,
        {
          borderLeftColor: color,
          opacity,
          transform: [{ translateY: translate }],
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${color}22` }]}>
        {icon}
      </View>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle !== undefined ? (
        <Text style={styles.sub}>{subtitle}</Text>
      ) : null}
      {trend !== undefined && trendValue !== undefined ? (
        <Text
          style={[
            styles.trend,
            { color: trend === "up" ? Colors.success : Colors.danger },
          ]}
        >
          {trend === "up" ? "↑" : "↓"} {trendValue}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 100,
    minWidth: 140,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    marginRight: Spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.sizes.xs,
    letterSpacing: 0.8,
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
  },
  value: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  sub: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  trend: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});
