import { Colors } from "./colors";

export const RoleEnum = {
  INSPECTOR: "INSPECTOR",
  ACCOUNTS: "ACCOUNTS",
  ADMIN: "ADMIN",
  CHAIRMAN: "CHAIRMAN",
} as const;

export type Role = (typeof RoleEnum)[keyof typeof RoleEnum];

export const RoleDisplayNames: Record<Role, string> = {
  INSPECTOR: "Inspector",
  ACCOUNTS: "Accounts",
  ADMIN: "Administrator",
  CHAIRMAN: "Chairman",
};

export const RoleBadgeColors: Record<Role, string> = {
  INSPECTOR: Colors.primaryLight,
  ACCOUNTS: Colors.accent,
  ADMIN: Colors.warning,
  CHAIRMAN: Colors.primaryDark,
};

export type PermissionAction =
  | "SUBMIT_COLLECTION"
  | "ACCEPT_COLLECTION"
  | "CREATE_DEMAND"
  | "CREATE_USER"
  | "TRANSFER_INSPECTOR"
  | "VIEW_ANALYTICS"
  | "VIEW_ALL_DISTRICTS"
  | "EXPORT_ALL"
  | "EXPORT_OWN";

const matrix: Record<Role, PermissionAction[]> = {
  INSPECTOR: ["SUBMIT_COLLECTION", "EXPORT_OWN"],
  ACCOUNTS: ["ACCEPT_COLLECTION", "EXPORT_OWN"],
  ADMIN: [
    "CREATE_DEMAND",
    "CREATE_USER",
    "TRANSFER_INSPECTOR",
    "VIEW_ANALYTICS",
    "VIEW_ALL_DISTRICTS",
    "EXPORT_ALL",
    "EXPORT_OWN",
  ],
  CHAIRMAN: ["VIEW_ANALYTICS", "VIEW_ALL_DISTRICTS", "EXPORT_ALL"],
};

export function canDo(role: Role | undefined, action: PermissionAction): boolean {
  if (role === undefined) {
    return false;
  }
  return matrix[role].includes(action);
}
