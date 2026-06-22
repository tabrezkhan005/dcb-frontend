import * as Application from "expo-application";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEY = "dcb_stable_device_id";

export async function getOrCreateDeviceId(): Promise<string> {
  try {
    const existing = await SecureStore.getItemAsync(KEY);
    if (existing !== null && existing.length > 0) {
      return existing;
    }
    if (Platform.OS === "android") {
      try {
        const androidId = Application.getAndroidId();
        if (androidId.length > 0) {
          await SecureStore.setItemAsync(KEY, androidId);
          return androidId;
        }
      } catch {
        /* fall through */
      }
    } else if (Platform.OS === "ios") {
      try {
        const idfv = await Application.getIosIdForVendorAsync();
        if (idfv !== null && idfv.length > 0) {
          await SecureStore.setItemAsync(KEY, idfv);
          return idfv;
        }
      } catch {
        /* fall through */
      }
    }
    const bundle =
      Application.applicationId ?? Application.applicationName ?? "dcb-ap";
    const random = await Crypto.getRandomBytesAsync(16);
    const hex = Array.from(random)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const id = `${bundle}-${hex}`;
    await SecureStore.setItemAsync(KEY, id);
    return id;
  } catch {
    return `fallback-${Date.now()}`;
  }
}
