import NetInfo from "@react-native-community/netinfo";
import { AppState } from "react-native";
import {
  QueryClient,
  focusManager,
  keepPreviousData,
  onlineManager,
} from "@tanstack/react-query";

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    const connected = state.isConnected === true;
    const reach = state.isInternetReachable;
    const ok =
      connected &&
      (reach === true || reach === null || reach === undefined);
    setOnline(ok);
  });
});

focusManager.setEventListener((handleFocus) => {
  const onChange = (status: string) => {
    handleFocus(status === "active");
  };
  const sub = AppState.addEventListener("change", onChange);
  return () => sub.remove();
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 1_000 * 60 * 120,
      retry: (failureCount, error) => {
        if (!onlineManager.isOnline()) {
          return false;
        }
        if (failureCount >= 1) {
          return false;
        }
        const err = error as { response?: { status?: number } } | undefined;
        const status = err?.response?.status;
        if (typeof status === "number" && status >= 400 && status < 500) {
          return false;
        }
        return true;
      },
      refetchOnReconnect: true,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      networkMode: "offlineFirst",
      placeholderData: keepPreviousData,
    },
    mutations: {
      networkMode: "online",
      retry: 0,
    },
  },
});
