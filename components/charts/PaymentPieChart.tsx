import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PolarChart, Pie } from "victory-native";
import type { PaymentMode } from "../../types/api.types";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";
import { formatAmount } from "../../utils/formatCurrency";
import { ChartShell } from "./ChartShell";

export interface PaymentPieDatum {
  mode: PaymentMode | string;
  amount: number;
  count: number;
}

interface PaymentPieChartProps {
  data: PaymentPieDatum[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

function modeColor(mode: string): string {
  switch (mode) {
    case "CASH":
      return Colors.chart.cash;
    case "CHEQUE":
      return Colors.chart.cheque;
    case "UPI":
      return Colors.chart.upi;
    case "DD":
      return Colors.chart.dd;
    default:
      return Colors.primaryLight;
  }
}

export function PaymentPieChart({
  data,
  title = "Payment modes",
  subtitle,
  loading = false,
}: PaymentPieChartProps) {
  const pieRows = useMemo(
    () =>
      data
        .filter((d) => d.amount > 0)
        .map((d) => ({
          label: d.mode,
          value: d.amount,
          count: d.count,
          color: modeColor(d.mode),
        })),
    [data],
  );

  const total = useMemo(
    () => pieRows.reduce((s, r) => s + r.value, 0),
    [pieRows],
  );

  const empty = !loading && pieRows.length === 0;

  return (
    <ChartShell
      title={title}
      subtitle={subtitle}
      loading={loading}
      empty={empty}
      emptyTitle="No payments"
      emptySubtitle="Payment breakdown appears when collections exist."
      minHeight={260}
      footer={
        <View style={styles.legend}>
          {pieRows.map((r) => {
            const pct = total > 0 ? Math.round((r.value / total) * 100) : 0;
            return (
              <View key={r.label} style={styles.legendRow}>
                <View style={[styles.swatch, { backgroundColor: r.color }]} />
                <View style={styles.legendMid}>
                  <Text style={styles.legendLabel}>{r.label}</Text>
                  <Text style={styles.legendSub}>
                    {r.count} txn · {pct}%
                  </Text>
                </View>
                <Text style={styles.legendAmt}>{formatAmount(r.value)}</Text>
              </View>
            );
          })}
        </View>
      }
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
            <Pie.Chart innerRadius="58%" />
          </PolarChart>
          <View style={styles.center} pointerEvents="none">
            <Text style={styles.centerLabel}>Total</Text>
            <Text style={styles.centerVal}>{formatAmount(total)}</Text>
          </View>
        </View>
      </View>
    </ChartShell>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  chart: { width: 220, height: 220, position: "relative" },
  polar: { width: 220, height: 220 },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  centerVal: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  legend: { gap: Spacing.sm },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  swatch: { width: 12, height: 12, borderRadius: 6 },
  legendMid: { flex: 1 },
  legendLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  legendSub: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  legendAmt: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
});
