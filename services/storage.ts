import * as SecureStore from "expo-secure-store";
import type { User } from "../types/api.types";

const KEYS = {
  access: "dcb_access_token",
  refresh: "dcb_refresh_token",
  user: "dcb_user_json",
} as const;

export async function saveToken(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEYS.access, accessToken);
    await SecureStore.setItemAsync(KEYS.refresh, refreshToken);
  } catch (e) {
    console.warn("saveToken failed", e);
    throw e;
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEYS.access);
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEYS.refresh);
  } catch {
    return null;
  }
}

export async function saveUser(user: User): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEYS.user, JSON.stringify(user));
  } catch (e) {
    console.warn("saveUser failed", e);
    throw e;
  }
}

export async function getUser(): Promise<User | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEYS.user);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function clearAll(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEYS.access);
    await SecureStore.deleteItemAsync(KEYS.refresh);
    await SecureStore.deleteItemAsync(KEYS.user);
  } catch {
    /* ignore */
  }
}
