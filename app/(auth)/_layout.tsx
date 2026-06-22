import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../stores/authStore";
import { RoleEnum } from "../../constants/roles";

function roleHome(
  role: string,
): "/(inspector)/(tabs)" | "/(accounts)/(tabs)" | "/(admin)/(tabs)" | "/(chairman)/(tabs)" {
  switch (role) {
    case RoleEnum.INSPECTOR:
      return "/(inspector)/(tabs)";
    case RoleEnum.ACCOUNTS:
      return "/(accounts)/(tabs)";
    case RoleEnum.ADMIN:
      return "/(admin)/(tabs)";
    case RoleEnum.CHAIRMAN:
      return "/(chairman)/(tabs)";
    default:
      return "/(inspector)/(tabs)";
  }
}

export default function AuthLayout() {
  const authed = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (authed && user !== null) {
    return <Redirect href={roleHome(user.role)} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
