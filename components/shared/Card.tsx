import type { ReactNode } from "react";
import { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { Colors } from "../../constants/colors";
import { BorderRadius, Shadows, Spacing } from "../../constants/spacing";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: number;
}

export function Card({ children, style, onPress, padding = Spacing.lg }: CardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  };

  const body = (
    <Animated.View
      style={[
        styles.card,
        Shadows.card,
        { padding },
        style,
        onPress !== undefined ? { transform: [{ scale }] } : null,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress !== undefined) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        android_ripple={{ color: Colors.surface2 }}
      >
        {body}
      </Pressable>
    );
  }

  return body;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
