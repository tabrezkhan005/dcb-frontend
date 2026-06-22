import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";

interface Option {
  label: string;
  value: string;
}

interface FilterChipsProps {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((o) => {
        const active = o.value === selected;
        return (
          <Pressable
            key={o.value}
            onPress={() => onSelect(o.value)}
            style={[styles.chip, active ? styles.chipOn : styles.chipOff]}
          >
            <Text style={[styles.lbl, active ? styles.lblOn : styles.lblOff]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minHeight: 44,
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  chipOn: { backgroundColor: Colors.primary },
  chipOff: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lbl: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  lblOn: { color: Colors.textOnDark },
  lblOff: { color: Colors.primary },
});
