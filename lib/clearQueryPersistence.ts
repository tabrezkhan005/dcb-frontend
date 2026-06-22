import { queryClient } from "./queryClient";
import { queryPersister } from "./queryPersister";

/** Clear in-memory queries and wipe persisted TanStack cache (call on sign-out). */
export async function clearQueryCacheAndPersistence(): Promise<void> {
  queryClient.clear();
  await queryPersister.removeClient();
}
