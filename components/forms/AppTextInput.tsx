import { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  hint?: string;
}

export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  function AppTextInput(
    { label, error, rightIcon, hint, style, onFocus, onBlur, ...rest },
    ref,
  ) {
    const [focused, setFocused] = useState(false);
    const showLabel = label !== undefined && label.trim().length > 0;
    return (
      <View style={styles.wrap}>
        {showLabel ? <Text style={styles.label}>{label}</Text> : null}
        <View
          style={[
            styles.field,
            focused && (error === undefined || error.length === 0)
              ? styles.fieldFocus
              : null,
            error !== undefined && error.length > 0 ? styles.fieldErr : null,
          ]}
        >
          <TextInput
            ref={ref}
            placeholderTextColor={Colors.textMuted}
            style={[styles.input, style]}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />
          {rightIcon !== undefined ? <View style={styles.right}>{rightIcon}</View> : null}
        </View>
        {hint !== undefined && (error === undefined || error.length === 0) ? (
          <Text style={styles.hint}>{hint}</Text>
        ) : null}
        {error !== undefined && error.length > 0 ? (
          <Text style={styles.err}>{error}</Text>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.lg },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
  },
  fieldFocus: { borderColor: Colors.borderFocus },
  fieldErr: { borderColor: Colors.danger },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  right: { marginLeft: Spacing.sm },
  hint: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  err: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.xs,
    color: Colors.danger,
  },
});
