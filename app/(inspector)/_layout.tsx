import { Stack } from "expo-router";
import { Redirect } from "expo-router";
import { useAuthStore } from "../../stores/authStore";
import { RoleEnum } from "../../constants/roles";

export default function InspectorRootLayout() {
  const user = useAuthStore((s) => s.user);
  if (user === null || user.role !== RoleEnum.INSPECTOR) {
    return <Redirect href="/" />;
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="collect/[demandId]" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
