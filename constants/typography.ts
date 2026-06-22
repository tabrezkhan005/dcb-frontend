import type { TextStyle } from "react-native";
import { Colors } from "./colors";

export const Typography = {
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 19,
    xl: 22,
    "2xl": 26,
    "3xl": 32,
  },
  weights: {
    regular: "400" as TextStyle["fontWeight"],
    medium: "500" as TextStyle["fontWeight"],
    semibold: "600" as TextStyle["fontWeight"],
    bold: "700" as TextStyle["fontWeight"],
  },
  lineHeights: {
    body: 1.4,
    heading: 1.2,
  },
} as const;

const baseFont: TextStyle = {
  fontFamily: undefined,
};

export const TextPresets = {
  heading1: {
    ...baseFont,
    fontSize: Typography.sizes["3xl"],
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.sizes["3xl"] * Typography.lineHeights.heading,
    color: Colors.textPrimary,
  } satisfies TextStyle,
  heading2: {
    ...baseFont,
    fontSize: Typography.sizes["2xl"],
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.sizes["2xl"] * Typography.lineHeights.heading,
    color: Colors.textPrimary,
  } satisfies TextStyle,
  heading3: {
    ...baseFont,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.sizes.xl * Typography.lineHeights.heading,
    color: Colors.textPrimary,
  } satisfies TextStyle,
  body: {
    ...baseFont,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.base * Typography.lineHeights.body,
    color: Colors.textPrimary,
  } satisfies TextStyle,
  bodySmall: {
    ...baseFont,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.body,
    color: Colors.textSecondary,
  } satisfies TextStyle,
  caption: {
    ...baseFont,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.xs * Typography.lineHeights.body,
    color: Colors.textMuted,
  } satisfies TextStyle,
  label: {
    ...baseFont,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.body,
    color: Colors.textSecondary,
  } satisfies TextStyle,
  button: {
    ...baseFont,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.sizes.md * Typography.lineHeights.heading,
    color: Colors.textOnDark,
  } satisfies TextStyle,
  amount: {
    ...baseFont,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.sizes.lg * Typography.lineHeights.heading,
    color: Colors.primary,
  } satisfies TextStyle,
} as const;
