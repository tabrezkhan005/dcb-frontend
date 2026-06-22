import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import Constants from "expo-constants";
import type { APIResponse } from "../types/api.types";
import * as storage from "./storage";

const baseURL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  "http://localhost:3000";

export class APIError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly payload?: unknown;

  constructor(
    message: string,
    status?: number,
    code?: string,
    payload?: unknown,
  ) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

let sessionExpiredHandler: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void): void {
  sessionExpiredHandler = handler;
}

const rawApi = axios.create({
  baseURL: `${baseURL.replace(/\/$/, "")}/api/v1`,
  timeout: 22_000,
  headers: { "Content-Type": "application/json" },
});

export const api: AxiosInstance = axios.create({
  baseURL: `${baseURL.replace(/\/$/, "")}/api/v1`,
  timeout: 22_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getAccessToken();
  if (token !== null) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const err = error as {
      config?: InternalAxiosRequestConfig & { _retry?: boolean };
      response?: { status?: number; data?: APIResponse<unknown> };
    };
    const status = err.response?.status;
    const original = err.config;
    if (
      status === 401 &&
      original !== undefined &&
      original._retry !== true &&
      !original.url?.includes("/auth/login") &&
      !original.url?.includes("/auth/refresh") &&
      !original.url?.includes("/auth/password")
    ) {
      original._retry = true;
      try {
        const refresh = await storage.getRefreshToken();
        if (refresh === null) {
          throw new APIError("Not authenticated", 401);
        }
        const res = await rawApi.post<APIResponse<{ accessToken: string; refreshToken: string }>>(
          "/auth/refresh",
          { refreshToken: refresh },
        );
        const body = res.data;
        if (body.success !== true || body.data === undefined) {
          throw new APIError(body.error ?? "Refresh failed", 401, body.code);
        }
        await storage.saveToken(body.data.accessToken, body.data.refreshToken);
        original.headers.Authorization = `Bearer ${body.data.accessToken}`;
        return api.request(original);
      } catch {
        await storage.clearAll();
        sessionExpiredHandler?.();
        return Promise.reject(new APIError("Session expired", 401));
      }
    }

    const data = err.response?.data as APIResponse<unknown> | undefined;
    const message =
      data?.error ??
      (error instanceof Error ? error.message : "Request failed");
    return Promise.reject(
      new APIError(
        message,
        status,
        data?.code,
        data,
      ),
    );
  },
);

function unwrap<T>(res: { data: APIResponse<T> }): T {
  const body = res.data;
  if (body.success !== true) {
    throw new APIError(body.error ?? "Invalid response", undefined, body.code);
  }
  if (body.data === undefined) {
    return undefined as T;
  }
  return body.data;
}

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get<APIResponse<T>>(url, config);
  return unwrap(res);
}

export async function post<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await api.post<APIResponse<T>>(url, body, config);
  return unwrap(res);
}

export async function patch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await api.patch<APIResponse<T>>(url, body, config);
  return unwrap(res);
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.delete<APIResponse<T>>(url, config);
  return unwrap(res);
}
