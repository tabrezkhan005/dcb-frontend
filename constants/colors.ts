/**
 * Government DCB AP design system — use ONLY these tokens.
 * Do not hardcode hex values elsewhere.
 */
export const Colors = {
  primary: "#1A237E",
  primaryLight: "#3949AB",
  primaryDark: "#0D1B6E",
  accent: "#00897B",
  accentLight: "#4DB6AC",
  warning: "#F57F17",
  danger: "#C62828",
  dangerLight: "#EF5350",
  success: "#2E7D32",
  successLight: "#66BB6A",
  background: "#F5F6FA",
  surface: "#FFFFFF",
  surface2: "#EEF0F8",
  textPrimary: "#1A1A2E",
  textSecondary: "#4A4A6A",
  textMuted: "#9090A0",
  textOnDark: "#FFFFFF",
  border: "#E0E0EE",
  borderFocus: "#3949AB",
  status: {
    pending: { bg: "#F57F17", bgLight: "#FFF8E1", text: "#E65100" },
    submitted: { bg: "#1565C0", bgLight: "#E3F2FD", text: "#0D47A1" },
    accepted: { bg: "#2E7D32", bgLight: "#E8F5E9", text: "#1B5E20" },
    queried: { bg: "#C62828", bgLight: "#FFEBEE", text: "#B71C1C" },
    overdue: { bg: "#AD1457", bgLight: "#FCE4EC", text: "#880E4F" },
    collected: { bg: "#00695C", bgLight: "#E0F2F1", text: "#004D40" },
    partial: { bg: "#E65100", bgLight: "#FBE9E7", text: "#BF360C" },
  },
  chart: {
    cash: "#1A237E",
    cheque: "#00897B",
    upi: "#F57F17",
    dd: "#C62828",
  },
} as const;

export type ColorsType = typeof Colors;
