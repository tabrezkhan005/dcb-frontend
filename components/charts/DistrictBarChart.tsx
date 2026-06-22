import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CartesianChart, BarGroup } from "victory-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";
import { formatAmountShort } from "../../utils/formatCurrency";
import { ChartShell } from "./ChartShell";

export interface DistrictBarDatum {
  district: string;
  collected: number;
  demanded: number;
}

interface DistrictBarChartProps {
  data: DistrictBarDatum[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

function recoveryColor(pct: number): string {
  if (pct < 50) {
    return Colors.danger;
  }
  if (pct <= 75) {
    return Colors.warning;
  }
  return Colors.success;
}

export function DistrictBarChart({
  data,
  title = "District comparison",
  subtitle,
  loading = false,
}: DistrictBarChartProps) {
  const chartData = useMemo(
    () =>
      data.map((d, ix) => {
        const collected = Number(d.collected);
        const demanded = Math.max(Number(d.demanded), 0.0001);
        const pct = Math.round((collected / demanded) * 100);
        return {
          ix,
          short: d.district.length > 12 ? `${d.district.slice(0, 11)}…` : d.district,
          collected,
          demanded,
          recovery: pct,
          barColor: recoveryColor(pct),
        };
      }),
    [data],
  );

  const empty = !loading && chartData.length === 0;
  const chartHeight = Math.min(520, Math.max(220, 48 * chartData.length + 100));

  return (
    <ChartShell
      title={title}
      subtitle={subtitle}
      loading={loading}
      empty={empty}
      emptyTitle="No districts"
      emptySubtitle="District performance will show when data is loaded."
      minHeight={chartHeight}
    >
      <View style={[styles.chartBox, { height: chartHeight }]}>
        <CartesianChart
          data={chartData}
          xKey="ix"
          yKeys={["demanded", "collected"]}
          domainPadding={{ left: 8, right: 120, top: 12, bottom: 8 }}
          axisOptions={{
            formatXLabel: (v) =>
              chartData.find((r) => r.ix === Number(v))?.short ?? "",
            formatYLabel: (v) => formatAmountShort(Number(v)),
            labelColor: Colors.textSecondary,
            lineColor: Colors.border,
          }}
        >
          {({ chartBounds, points }) => (
            <BarGroup
              chartBounds={chartBounds}
              betweenGroupPadding={0.35}
              withinGroupPadding={0.2}
            >
              <BarGroup.Bar points={points.demanded} color={Colors.surface2} />
              <BarGroup.Bar points={points.collected} color={Colors.accent} />
            </BarGroup>
          )}
        </CartesianChart>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.recScroll}
        contentContainerStyle={styles.recRow}
      >
        {chartData.map((r) => (
          <View key={String(r.ix)} style={styles.recChip}>
            <Text style={styles.recName} numberOfLines={1}>
              {r.short}
            </Text>
            <Text style={[styles.recPct, { color: r.barColor }]}>{r.recovery}%</Text>
          </View>
        ))}
      </ScrollView>
    </ChartShell>
  );
}

const styles = StyleSheet.create({
  chartBox: { width: "100%" },
  recScroll: { marginTop: Spacing.sm },
  recRow: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  recChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface2,
    borderRadius: 9999,
    maxWidth: 160,
  },
  recName: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  recPct: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});
