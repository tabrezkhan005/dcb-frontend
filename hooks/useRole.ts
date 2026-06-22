import { useAuthStore } from "../stores/authStore";
import type { Role } from "../types/api.types";
import { canDo, type PermissionAction } from "../constants/roles";

export function useRole(): Role | undefined {
  return useAuthStore((s) => s.user?.role);
}

export function useIsInspector(): boolean {
  return useAuthStore((s) => s.user?.role === "INSPECTOR");
}

export function useIsAccounts(): boolean {
  return useAuthStore((s) => s.user?.role === "ACCOUNTS");
}

export function useIsAdmin(): boolean {
  return useAuthStore((s) => s.user?.role === "ADMIN");
}

export function useIsChairman(): boolean {
  return useAuthStore((s) => s.user?.role === "CHAIRMAN");
}

export function useCanDo(action: PermissionAction): boolean {
  const role = useAuthStore((s) => s.user?.role);
  return canDo(role, action);
}
