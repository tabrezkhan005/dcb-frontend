import { StyleSheet, Text, type TextStyle } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { formatAmount } from "../../utils/formatCurrency";

type Size = "sm" | "md" | "lg" | "xl";

interface AmountTextProps {
  amount: string | number;
  size?: Size;
  color?: string;
  weight?: TextStyle["fontWeight"];
  style?: TextStyle;
}

const sizeMap: Record<Size, { fontSize: number; weight: TextStyle["fontWeight"] }> = {
  sm: { fontSize: Typography.sizes.sm, weight: Typography.weights.regular },
  md: { fontSize: Typography.sizes.md, weight: Typography.weights.medium },
  lg: { fontSize: 20, weight: Typography.weights.semibold },
  xl: { fontSize: 28, weight: Typography.weights.bold },
};

export function AmountText({
  amount,
  size = "md",
  color = Colors.primary,
  weight,
  style,
}: AmountTextProps) {
  const m = sizeMap[size];
  return (
    <Text
      style={[
        styles.base,
        {
          fontSize: m.fontSize,
          fontWeight: weight ?? m.weight,
          color,
        },
        style,
      ]}
    >
      {formatAmount(amount)}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { lineHeight: undefined },
});
