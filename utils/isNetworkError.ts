import { APIError } from "../services/api";

/** True when the failure is likely due to no route to the host (offline, DNS, TLS handshake). */
export function isNetworkLikeError(error: unknown): boolean {
  if (error === null || error === undefined) {
    return false;
  }
  if (error instanceof APIError) {
    if (error.status === undefined && error.message.toLowerCase().includes("network")) {
      return true;
    }
  }
  const err = error as { code?: string; message?: string; name?: string };
  if (err.code === "ERR_NETWORK") {
    return true;
  }
  if (typeof err.message === "string") {
    const m = err.message.toLowerCase();
    if (m.includes("network error")) {
      return true;
    }
    if (m.includes("network request failed")) {
      return true;
    }
  }
  return false;
}
