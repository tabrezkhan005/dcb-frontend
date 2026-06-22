import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: number;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  onRowPress?: (row: T) => void;
  stickyFirstColumn?: boolean;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowPress,
}: DataTableProps<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View>
        <View style={styles.headerRow}>
          {columns.map((c) => (
            <View
              key={String(c.key)}
              style={[
                styles.cell,
                { width: c.width ?? 120 },
                c.align === "right" && { alignItems: "flex-end" },
              ]}
            >
              <Text style={styles.headerText}>{c.label}</Text>
            </View>
          ))}
        </View>
        {data.map((row, ri) => (
          <Pressable
            key={String(ri)}
            onPress={() => onRowPress?.(row)}
            style={[styles.dataRow, ri % 2 === 1 && { backgroundColor: Colors.surface2 }]}
          >
            {columns.map((c) => {
              const val = row[c.key as keyof T];
              const str =
                typeof val === "string" || typeof val === "number"
                  ? String(val)
                  : "";
              return (
                <View
                  key={String(c.key)}
                  style={[
                    styles.cell,
                    { width: c.width ?? 120 },
                    c.align === "right" && { alignItems: "flex-end" },
                  ]}
                >
                  <Text style={styles.cellText} numberOfLines={2}>
                    {str}
                  </Text>
                </View>
              );
            })}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
  },
  dataRow: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  cell: {
    padding: Spacing.md,
    justifyContent: "center",
  },
  headerText: {
    color: Colors.textOnDark,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  cellText: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.sm,
  },
});
