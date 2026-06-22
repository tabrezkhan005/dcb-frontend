import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Area, CartesianChart, Line, Scatter } from "victory-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";
import { formatAmountShort } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { ChartShell } from "./ChartShell";

export interface TrendLineDatum {
  date: string;
  amount: number;
}

interface TrendLineChartProps {
  data: TrendLineDatum[];
  title: string;
  subtitle?: string;
  loading?: boolean;
}

export function TrendLineChart({
  data,
  title,
  subtitle,
  loading = false,
}: TrendLineChartProps) {
  const chartData = useMemo(() => {
    return data.map((row, i) => {
      const slice = data.slice(Math.max(0, i - 2), i + 1);
      const rolling =
        slice.reduce((s, x) => s + x.amount, 0) / Math.max(1, slice.length);
      return {
        label: row.date,
        amount: row.amount,
        rolling,
      };
    });
  }, [data]);

  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { min: 0, max: 0, minLbl: "", maxLbl: "" };
    }
    let minI = 0;
    let maxI = 0;
    chartData.forEach((r, i) => {
      if (r.amount < chartData[minI].amount) {
        minI = i;
      }
      if (r.amount > chartData[maxI].amount) {
        maxI = i;
      }
    });
    return {
      min: chartData[minI].amount,
      max: chartData[maxI].amount,
      minLbl: formatDate(chartData[minI].label),
      maxLbl: formatDate(chartData[maxI].label),
    };
  }, [chartData]);

  const empty = !loading && chartData.length === 0;

  return (
    <ChartShell
      title={title}
      subtitle={subtitle}
      loading={loading}
      empty={empty}
      emptyTitle="No trend data"
      emptySubtitle="Monthly collection trend will display here."
      minHeight={240}
      footer={
        <View style={styles.footer}>
          <Text style={styles.stat}>
            Low: {formatAmountShort(stats.min)} ({stats.minLbl})
          </Text>
          <Text style={styles.stat}>
            High: {formatAmountShort(stats.max)} ({stats.maxLbl})
          </Text>
        </View>
      }
    >
      <View style={styles.chartBox}>
        <CartesianChart
          data={chartData}
          xKey="label"
          yKeys={["amount", "rolling"]}
          domainPadding={{ left: 12, right: 12, top: 24, bottom: 12 }}
          axisOptions={{
            formatXLabel: (v) => formatDate(String(v)),
            formatYLabel: (v) => formatAmountShort(Number(v)),
            labelColor: Colors.textSecondary,
            lineColor: Colors.border,
          }}
        >
          {({ chartBounds, points }) => (
            <>
              <Area
                points={points.amount}
                y0={chartBounds.bottom}
                color={Colors.primary}
                opacity={0.12}
                curveType="natural"
              />
              <Line
                points={points.amount}
                color={Colors.primary}
                strokeWidth={3}
                curveType="natural"
              />
              <Line
                points={points.rolling}
                color={Colors.accent}
                strokeWidth={2}
                curveType="natural"
              />
              <Scatter
                points={points.amount}
                shape="circle"
                radius={4}
                style="fill"
                color={Colors.primary}
              />
            </>
          )}
        </CartesianChart>
      </View>
      <View style={styles.key}>
        <View style={styles.keyRow}>
          <View style={[styles.keyDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.keyTxt}>Collected</Text>
        </View>
        <View style={styles.keyRow}>
          <View style={[styles.keyDot, { backgroundColor: Colors.accent }]} />
          <Text style={styles.keyTxt}>3-mo avg</Text>
        </View>
      </View>
    </ChartShell>
  );
}

const styles = StyleSheet.create({
  chartBox: { height: 240, width: "100%" },
  footer: { gap: Spacing.xs },
  stat: { fontSize: Typography.sizes.xs, color: Colors.textSecondary },
  key: { flexDirection: "row", gap: Spacing.lg, marginTop: Spacing.sm },
  keyRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  keyDot: { width: 8, height: 8, borderRadius: 4 },
  keyTxt: { fontSize: Typography.sizes.xs, color: Colors.textPrimary },
});
