import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { BorderRadius, Spacing } from "../../constants/spacing";

interface SearchBarProps {
  placeholder: string;
  onSearch: (q: string) => void;
  style?: object;
}

export function SearchBar({ placeholder, onSearch, style }: SearchBarProps) {
  const [text, setText] = useState("");
  useEffect(() => {
    const t = setTimeout(() => onSearch(text), 300);
    return () => clearTimeout(t);
  }, [text, onSearch]);

  return (
    <View style={[styles.wrap, style]}>
      <Ionicons name="search" size={20} color={Colors.textMuted} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={text}
        onChangeText={setText}
      />
      {text.length > 0 ? (
        <Pressable onPress={() => setText("")} hitSlop={8}>
          <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
});
