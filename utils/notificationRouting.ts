import { router } from "expo-router";
import type { Role } from "../constants/roles";
import { RoleEnum } from "../constants/roles";

export interface PushPayload {
  collectionId?: string;
  type?: string;
  receiptNumber?: string;
}

export function navigateFromPushPayload(
  role: Role | undefined,
  data: PushPayload,
): void {
  const collectionId = data.collectionId;
  if (collectionId !== undefined && collectionId.length > 0) {
    if (role === RoleEnum.ACCOUNTS) {
      router.push(`/(accounts)/collection/${collectionId}`);
      return;
    }
    if (role === RoleEnum.ADMIN) {
      router.push("/(admin)/(tabs)/demands");
      return;
    }
    if (role === RoleEnum.INSPECTOR) {
      router.push("/(inspector)/(tabs)/receipts");
      return;
    }
  }

  if (role === RoleEnum.INSPECTOR) {
    router.push("/(inspector)/notifications");
    return;
  }
  if (role === RoleEnum.ACCOUNTS) {
    router.push("/(accounts)/(tabs)");
    return;
  }
  if (role === RoleEnum.ADMIN) {
    router.push("/(admin)/(tabs)");
    return;
  }
  if (role === RoleEnum.CHAIRMAN) {
    router.push("/(chairman)/(tabs)");
    return;
  }
}
