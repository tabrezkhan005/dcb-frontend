import { useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { BorderRadius, Spacing } from "../../constants/spacing";
import type { ComponentProps } from "react";

interface FloatingActionButtonProps {
  icon: ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
}

export function FloatingActionButton({ icon, onPress }: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View
      style={[
        styles.wrap,
        { bottom: Spacing.xl + insets.bottom, transform: [{ scale }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start()
        }
        style={styles.btn}
      >
        <Ionicons name={icon} size={26} color={Colors.textOnDark} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", right: Spacing.lg },
  btn: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});
