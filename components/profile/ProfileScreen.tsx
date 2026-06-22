import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../stores/authStore";
import { QueryKeys } from "../../constants/queryKeys";
import { RoleBadgeColors, RoleDisplayNames } from "../../constants/roles";
import type { Role } from "../../types/api.types";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";
import { listDistricts } from "../../services/dcb";
import { changePassword } from "../../services/auth";
import { getOrCreateDeviceId } from "../../utils/deviceId";
import { AppHeader } from "../shared/AppHeader";
import { ScreenWrapper } from "../shared/ScreenWrapper";
import { Card } from "../shared/Card";
import { AppButton } from "../forms/AppButton";
import { BottomSheet } from "../shared/BottomSheet";
import { AppTextInput } from "../forms/AppTextInput";

interface ProfileScreenProps {
  role: Role;
  statsSlot: React.ReactNode;
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  if (p.length === 0) {
    return "?";
  }
  if (p.length === 1) {
    return p[0].slice(0, 2).toUpperCase();
  }
  return `${p[0][0] ?? ""}${p[1][0] ?? ""}`.toUpperCase();
}

export function ProfileScreen({ role, statsSlot }: ProfileScreenProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [deviceId, setDeviceId] = useState<string>("");
  const [sheetPw, setSheetPw] = useState(false);
  const [sheetNotif, setSheetNotif] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [permLabel, setPermLabel] = useState<string>("");

  const { data: districts } = useQuery({
    queryKey: QueryKeys.DISTRICTS,
    queryFn: listDistricts,
  });

  const districtName = useMemo(() => {
    if (user === null) {
      return "";
    }
    return districts?.find((d) => d.id === user.districtId)?.name ?? "—";
  }, [districts, user]);

  useEffect(() => {
    void getOrCreateDeviceId().then(setDeviceId);
  }, []);

  useEffect(() => {
    if (!sheetNotif) {
      return;
    }
    void Notifications.getPermissionsAsync().then((r) => {
      setPermLabel(r.status === "granted" ? "Allowed" : r.status === "denied" ? "Denied" : "Not determined");
    });
  }, [sheetNotif]);

  const pwMut = useMutation({
    mutationFn: () =>
      changePassword({
        currentPassword: currentPw,
        newPassword: newPw,
      }),
    onSuccess: () => {
      setSheetPw(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      Alert.alert("Password updated", "Use your new password next time you sign in on another device.");
    },
    onError: (e) => {
      Alert.alert("Could not update", e instanceof Error ? e.message : "Try again");
    },
  });

  const version =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? "1.0.0";

  const onSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          void logout();
        },
      },
    ]);
  };

  const submitPassword = () => {
    if (newPw.length < 8) {
      Alert.alert("Password", "New password must be at least 8 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert("Password", "New password and confirmation do not match.");
      return;
    }
    pwMut.mutate();
  };

  if (user === null) {
    return null;
  }

  const badgeBg = RoleBadgeColors[role as keyof typeof RoleBadgeColors];

  return (
    <ScreenWrapper scrollable omitStatusBar statusBarVariant="light">
      <AppHeader title="Profile" subtitle={districtName} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Card padding={Spacing.lg} style={styles.card}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
              <Text style={styles.avatarTxt}>{initials(user.name)}</Text>
            </View>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: badgeBg }]}>
            <Text style={styles.roleBadgeTxt}>
              {RoleDisplayNames[role as keyof typeof RoleDisplayNames]}
            </Text>
          </View>
          <Text style={styles.meta}>{districtName}</Text>
          {user.phone !== undefined ? <Text style={styles.meta}>{user.phone}</Text> : null}
        </Card>

        <Text style={styles.sectionTitle}>This period</Text>
        {statsSlot}

        <Text style={styles.sectionTitle}>Settings</Text>
        <Card padding={0} style={styles.card}>
          <Pressable style={styles.row} onPress={() => setSheetPw(true)}>
            <Text style={styles.rowLabel}>Change password</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row} onPress={() => setSheetNotif(true)}>
            <Text style={styles.rowLabel}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </Pressable>
          <View style={styles.divider} />
          <View style={styles.rowCol}>
            <Text style={styles.rowLabel}>Device ID</Text>
            <Text style={styles.mutedSmall} numberOfLines={2}>
              {deviceId.length > 0 ? deviceId : "—"}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowCol}>
            <Text style={styles.rowLabel}>App version</Text>
            <Text style={styles.mutedSmall}>DCB AP v{version}</Text>
          </View>
        </Card>

        <AppButton label="Sign out" variant="danger" fullWidth onPress={onSignOut} style={styles.signOut} />
      </ScrollView>

      <BottomSheet visible={sheetPw} onClose={() => setSheetPw(false)} title="Change password" heightFraction={0.65}>
        <AppTextInput
          label="Current password"
          value={currentPw}
          onChangeText={setCurrentPw}
          secureTextEntry
        />
        <AppTextInput label="New password (min 8)" value={newPw} onChangeText={setNewPw} secureTextEntry />
        <AppTextInput label="Confirm new password" value={confirmPw} onChangeText={setConfirmPw} secureTextEntry />
        <AppButton label="Update password" onPress={submitPassword} loading={pwMut.isPending} />
        <AppButton label="Cancel" variant="ghost" onPress={() => setSheetPw(false)} />
      </BottomSheet>

      <BottomSheet visible={sheetNotif} onClose={() => setSheetNotif(false)} title="Notifications">
        <Text style={styles.sheetTxt}>
          Push permission: <Text style={styles.sheetEm}>{permLabel}</Text>
        </Text>
        <Text style={styles.sheetTxt}>
          To allow or block alerts, sounds, and badges, use your device settings for this app.
        </Text>
        <AppButton
          label="Open app settings"
          onPress={() => {
            void Linking.openSettings();
          }}
        />
        <AppButton label="Close" variant="ghost" onPress={() => setSheetNotif(false)} />
      </BottomSheet>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing["3xl"],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  card: { marginBottom: Spacing.lg },
  avatarWrap: { alignItems: "center", marginBottom: Spacing.md },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: {
    color: Colors.textOnDark,
    fontSize: 24,
    fontWeight: Typography.weights.bold,
  },
  name: {
    textAlign: "center",
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  roleBadge: {
    alignSelf: "center",
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 9999,
  },
  roleBadgeTxt: {
    color: Colors.textOnDark,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  meta: {
    textAlign: "center",
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  row: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  rowCol: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  rowLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  mutedSmall: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.lg,
  },
  signOut: { marginTop: Spacing.xl },
  sheetTxt: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  sheetEm: { fontWeight: Typography.weights.semibold, color: Colors.textPrimary },
});
