import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../stores/authStore";
import { RoleEnum } from "../../constants/roles";

export default function AdminRootLayout() {
  const user = useAuthStore((s) => s.user);
  if (user === null || user.role !== RoleEnum.ADMIN) {
    return <Redirect href="/" />;
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="inspectors/[id]" />
      <Stack.Screen name="demands/create" />
      <Stack.Screen name="users/create" />
      <Stack.Screen name="users/[id]" />
      <Stack.Screen name="institutions/index" />
      <Stack.Screen name="institutions/create" />
      <Stack.Screen name="institutions/[id]" />
      <Stack.Screen name="audit" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
