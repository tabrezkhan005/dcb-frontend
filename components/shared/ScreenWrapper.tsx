import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
  type ScrollViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { ScreenPadding } from "../../constants/spacing";
import { AppStatusBar } from "./StatusBar";

interface ScreenWrapperProps {
  children: ReactNode;
  backgroundColor?: string;
  statusBarVariant?: "dark" | "light";
  scrollable?: boolean;
  contentStyle?: ViewStyle;
  /** When AppHeader is used, it owns the status bar. */
  omitStatusBar?: boolean;
  refreshControl?: ScrollViewProps["refreshControl"];
}

export function ScreenWrapper({
  children,
  backgroundColor = Colors.background,
  statusBarVariant = "light",
  scrollable = false,
  contentStyle,
  omitStatusBar = false,
  refreshControl,
}: ScreenWrapperProps) {
  const inner = scrollable ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.padH, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]}>
      {omitStatusBar ? null : <AppStatusBar variant={statusBarVariant} />}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {inner}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  padH: { paddingHorizontal: ScreenPadding },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: ScreenPadding,
    paddingBottom: 24,
  },
});
