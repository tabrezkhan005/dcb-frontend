import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../stores/authStore";
import { RoleEnum } from "../../constants/roles";

export default function ChairmanRootLayout() {
  const user = useAuthStore((s) => s.user);
  if (user === null || user.role !== RoleEnum.CHAIRMAN) {
    return <Redirect href="/" />;
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
