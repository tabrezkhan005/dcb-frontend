import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PolarChart, Pie } from "victory-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";
import { ChartShell } from "./ChartShell";

interface RecoveryGaugeChartProps {
  percentage: number;
  label: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

function gaugeMainColor(pct: number): string {
  if (pct < 50) {
    return Colors.danger;
  }
  if (pct <= 75) {
    return Colors.warning;
  }
  return Colors.success;
}

export function RecoveryGaugeChart({
  percentage,
  label,
  title = "Recovery",
  subtitle,
  loading = false,
}: RecoveryGaugeChartProps) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const main = gaugeMainColor(clamped);

  const pieRows = useMemo(
    () => [
      { label: "p", value: Math.max(clamped, 0.0001), color: main },
      { label: "r", value: Math.max(100 - clamped, 0.0001), color: Colors.surface2 },
    ],
    [clamped, main],
  );

  return (
    <ChartShell
      title={title}
      subtitle={subtitle}
      loading={loading}
      empty={false}
      minHeight={200}
    >
      <View style={styles.wrap}>
        <View style={styles.chart}>
          <PolarChart
            data={pieRows}
            labelKey="label"
            valueKey="value"
            colorKey="color"
            containerStyle={styles.polar}
          >
            <Pie.Chart
              innerRadius="68%"
              circleSweepDegrees={180}
              startAngle={180}
            />
          </PolarChart>
          <View style={styles.center} pointerEvents="none">
            <Text style={[styles.pct, { color: main }]}>{Math.round(clamped)}%</Text>
            <Text style={styles.sub}>{label}</Text>
          </View>
        </View>
      </View>
    </ChartShell>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  chart: { width: 240, height: 140, position: "relative" },
  polar: { width: 240, height: 140 },
  center: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Spacing.sm,
    alignItems: "center",
  },
  pct: {
    fontSize: Typography.sizes["2xl"],
    fontWeight: Typography.weights.bold,
  },
  sub: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
});
