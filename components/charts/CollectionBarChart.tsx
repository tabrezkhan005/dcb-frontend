import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { runOnJS, useAnimatedReaction } from "react-native-reanimated";
import {
  BarGroup,
  CartesianChart,
  useChartPressState,
} from "victory-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";
import { formatAmount } from "../../utils/formatCurrency";
import { ChartShell } from "./ChartShell";

export interface CollectionBarDatum {
  month: string;
  collected: number;
  target: number;
}

interface CollectionBarChartProps {
  data: CollectionBarDatum[];
  title: string;
  subtitle?: string;
  loading?: boolean;
}

export function CollectionBarChart({
  data,
  title,
  subtitle,
  loading = false,
}: CollectionBarChartProps) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        month: d.month,
        collected: d.collected,
        target: d.target,
      })),
    [data],
  );

  const first = chartData[0];
  const { state, isActive } = useChartPressState({
    x: first?.month ?? "",
    y: {
      collected: first?.collected ?? 0,
      target: first?.target ?? 0,
    },
  });

  const [tip, setTip] = useState("");

  useAnimatedReaction(
    () => ({
      active: state.isActive.value,
      month: state.x.value.value,
      c: state.y.collected.value.value,
      t: state.y.target.value.value,
    }),
    (v) => {
      if (!v.active) {
        runOnJS(setTip)("");
        return;
      }
      runOnJS(setTip)(
        `${String(v.month)} · ${formatAmount(v.c)} / ${formatAmount(v.t)}`,
      );
    },
    [state],
  );

  const empty = !loading && chartData.length === 0;

  return (
    <ChartShell
      title={title}
      subtitle={subtitle}
      loading={loading}
      empty={empty}
      emptyTitle="No monthly data"
      emptySubtitle="Collection totals will appear once data is available."
      minHeight={220}
      footer={
        <View>
          {tip.length > 0 || isActive ? (
            <Text style={styles.tip}>{tip.length > 0 ? tip : " "}</Text>
          ) : null}
          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendTxt}>Collected</Text>
            </View>
            <View style={styles.legendRow}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.primary },
                ]}
              />
              <Text style={styles.legendTxt}>Target</Text>
            </View>
          </View>
        </View>
      }
    >
      <View style={styles.chartBox}>
        <CartesianChart
          chartPressState={state}
          data={chartData}
          xKey="month"
          yKeys={["collected", "target"]}
          domainPadding={{ left: 24, right: 24, top: 16, bottom: 8 }}
          axisOptions={{
            formatYLabel: (v) => formatAmount(Number(v)),
            labelColor: Colors.textSecondary,
            lineColor: Colors.border,
          }}
        >
          {({ chartBounds, points }) => (
            <BarGroup
              chartBounds={chartBounds}
              betweenGroupPadding={0.3}
              withinGroupPadding={0.15}
            >
              <BarGroup.Bar points={points.collected} color={Colors.primary} />
              <BarGroup.Bar points={points.target} color={Colors.surface2} />
            </BarGroup>
          )}
        </CartesianChart>
      </View>
    </ChartShell>
  );
}

const styles = StyleSheet.create({
  chartBox: { height: 220, width: "100%" },
  tip: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  legend: { flexDirection: "row", gap: Spacing.xl },
  legendRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendTxt: { fontSize: Typography.sizes.sm, color: Colors.textPrimary },
});
