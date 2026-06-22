import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { defaultShouldDehydrateQuery } from "@tanstack/react-query";
import type { Query } from "@tanstack/react-query";
import Constants from "expo-constants";

const STORAGE_KEY = "dcb-react-query-cache";

/** Bump when persisted shape must be discarded (e.g. breaking API changes). */
export const QUERY_CACHE_BUSTER =
  (Constants.expoConfig?.version as string | undefined) ??
  Constants.nativeAppVersion ??
  "1.0.0";

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: STORAGE_KEY,
  throttleTime: 2500,
});

/** Skip volatile keys (export job polling) from disk to keep payload small. */
export function shouldPersistQuery(query: Query): boolean {
  if (!defaultShouldDehydrateQuery(query)) {
    return false;
  }
  const key = query.queryKey;
  if (key[0] === "exports" && key[1] !== "list") {
    return false;
  }
  return true;
}
