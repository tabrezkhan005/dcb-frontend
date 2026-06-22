import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { AppHeader } from "../../../components/shared/AppHeader";
import { ScreenWrapper } from "../../../components/shared/ScreenWrapper";
import { Card } from "../../../components/shared/Card";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";
import { Colors } from "../../../constants/colors";

export default function AdminMoreScreen() {
  return (
    <ScreenWrapper scrollable omitStatusBar>
      <AppHeader title="More" />
      <Card padding={Spacing.lg}>
        <Pressable style={styles.row} onPress={() => router.push("/(admin)/institutions")}>
          <Text style={styles.txt}>Institutions</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => router.push("/(admin)/profile")}>
          <Text style={styles.txt}>Profile</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => router.push("/(admin)/audit")}>
          <Text style={styles.txt}>Audit log</Text>
        </Pressable>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 48, justifyContent: "center" },
  txt: { fontSize: Typography.sizes.md, color: Colors.primary, fontWeight: Typography.weights.medium },
});
