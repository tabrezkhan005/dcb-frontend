import { post, patch } from "./api";
import type { LoginResponse, PasswordChangeResult, RefreshResponse } from "../types/api.types";
export async function login(
  phone: string,
  password: string,
  deviceId: string,
): Promise<LoginResponse> {
  return post<LoginResponse>("/auth/login", {
    phone,
    password,
    deviceId,
  });
}

export async function logout(): Promise<void> {
  await post("/auth/logout", {});
}

export async function refreshToken(
  refreshTokenValue: string,
): Promise<RefreshResponse> {
  return post<RefreshResponse>("/auth/refresh", {
    refreshToken: refreshTokenValue,
  });
}

export async function savePushToken(token: string): Promise<void> {
  await patch("/auth/push-token", { pushToken: token });
}

export async function changePassword(body: {
  currentPassword: string;
  newPassword: string;
}): Promise<PasswordChangeResult> {
  return patch<PasswordChangeResult>("/auth/password", body);
}