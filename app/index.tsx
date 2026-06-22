import { Redirect } from "expo-router";
import { useAuthStore } from "../stores/authStore";
import { RoleEnum } from "../constants/roles";

export default function Index() {
  const authed = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!authed || user === null) {
    return <Redirect href="/(auth)/login" />;
  }

  switch (user.role) {
    case RoleEnum.INSPECTOR:
      return <Redirect href="/(inspector)/(tabs)" />;
    case RoleEnum.ACCOUNTS:
      return <Redirect href="/(accounts)/(tabs)" />;
    case RoleEnum.ADMIN:
      return <Redirect href="/(admin)/(tabs)" />;
    case RoleEnum.CHAIRMAN:
      return <Redirect href="/(chairman)/(tabs)" />;
    default:
      return <Redirect href="/(auth)/login" />;
  }
}
