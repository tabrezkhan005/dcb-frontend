import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";
import { BottomSheet } from "../shared/BottomSheet";

interface Option {
  label: string;
  value: string;
}

interface AppPickerProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function AppPicker({
  label,
  options,
  value,
  onChange,
  error,
}: AppPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value)?.label ?? "Select";

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          error !== undefined && error.length > 0 ? styles.fieldErr : null,
        ]}
      >
        <Text style={styles.value}>{selected}</Text>
        <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
      </Pressable>
      {error !== undefined && error.length > 0 ? (
        <Text style={styles.err}>{error}</Text>
      ) : null}
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={label}>
        <ScrollView keyboardShouldPersistTaps="handled">
          {options.map((o) => (
            <Pressable
              key={o.value}
              style={styles.opt}
              onPress={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              <Text style={styles.optTxt}>{o.label}</Text>
              {o.value === value ? (
                <Ionicons name="checkmark" size={20} color={Colors.primary} />
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

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
    justifyContent: "space-between",
    backgroundColor: Colors.surface2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
  },
  fieldErr: { borderColor: Colors.danger },
  value: { fontSize: Typography.sizes.base, color: Colors.textPrimary },
  err: { marginTop: Spacing.xs, color: Colors.danger, fontSize: Typography.sizes.xs },
  opt: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    minHeight: 48,
  },
  optTxt: { fontSize: Typography.sizes.base, color: Colors.textPrimary },
});
