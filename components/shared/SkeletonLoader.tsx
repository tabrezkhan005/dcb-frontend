import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type ViewStyle } from "react-native";
import { Colors } from "../../constants/colors";
import { BorderRadius, Spacing } from "../../constants/spacing";

export function SkeletonBox({
  width = "100%" as const,
  height = 16,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.38,
          duration: 520,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.box,
        { width, height, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonBox height={18} width="60%" />
      <SkeletonBox height={14} width="40%" style={{ marginTop: Spacing.sm }} />
      <SkeletonBox height={12} width="80%" style={{ marginTop: Spacing.md }} />
    </View>
  );
}

export function SkeletonKPI() {
  return (
    <View style={styles.kpi}>
      <SkeletonBox height={14} width="50%" />
      <SkeletonBox height={28} width="70%" style={{ marginTop: Spacing.sm }} />
    </View>
  );
}

export function SkeletonList({ rows = 2 }: { rows?: number }) {
  const n = Math.min(8, Math.max(1, rows));
  return (
    <View>
      {Array.from({ length: n }).map((_, i) => (
        <SkeletonCard key={String(i)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: Colors.surface2,
    borderRadius: BorderRadius.sm,
  },
  card: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  kpi: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    width: 160,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
