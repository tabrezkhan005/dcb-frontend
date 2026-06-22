import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { BorderRadius, Shadows, Spacing } from "../../constants/spacing";
import { EmptyState } from "../shared/EmptyState";
import { SkeletonBox } from "../shared/SkeletonLoader";

interface ChartShellProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  minHeight?: number;
  children: ReactNode;
  footer?: ReactNode;
  style?: ViewStyle;
}

export function ChartShell({
  title,
  subtitle,
  loading = false,
  empty = false,
  emptyTitle = "No data",
  emptySubtitle = "There is nothing to display for this period.",
  minHeight = 200,
  children,
  footer,
  style,
}: ChartShellProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.card,
        Shadows.card,
        { opacity, transform: [{ translateY }] },
        style,
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      {subtitle !== undefined ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
      <View style={[styles.body, { minHeight }]}>
        {loading ? (
          <View style={styles.skel}>
            <SkeletonBox height={140} width="100%" />
            <SkeletonBox
              height={12}
              width="70%"
              style={{ marginTop: Spacing.md }}
            />
          </View>
        ) : empty ? (
          <EmptyState title={emptyTitle} subtitle={emptySubtitle} />
        ) : (
          children
        )}
      </View>
      {footer !== undefined ? <View style={styles.footer}>{footer}</View> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes.md * 1.2,
  },
  subtitle: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  body: { marginTop: Spacing.md },
  skel: { justifyContent: "center", flex: 1 },
  footer: { marginTop: Spacing.md },
});
