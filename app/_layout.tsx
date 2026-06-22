import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot, useRouter } from "expo-router";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { Colors } from "../constants/colors";
import { useAuthStore } from "../stores/authStore";
import { LoadingScreen } from "../components/shared/LoadingScreen";
import { OfflineBanner } from "../components/shared/OfflineBanner";
import { BackgroundFetchIndicator } from "../components/shared/BackgroundFetchIndicator";
import { QUERY_CACHE_BUSTER, queryPersister, shouldPersistQuery } from "../lib/queryPersister";
import { setSessionExpiredHandler } from "../services/api";
import { useNotifications } from "../hooks/useNotifications";
import { queryClient } from "../lib/queryClient";

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    onPrimary: Colors.textOnDark,
    primaryContainer: Colors.primaryLight,
    secondary: Colors.accent,
    surface: Colors.surface,
    background: Colors.background,
    error: Colors.danger,
    onSurface: Colors.textPrimary,
    onSurfaceVariant: Colors.textSecondary,
    outline: Colors.border,
  },
};

const PERSIST_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

export default function RootLayout() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.isHydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const logoutLocal = useAuthStore((s) => s.logoutLocal);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      void logoutLocal();
      router.replace("/(auth)/login");
    });
  }, [logoutLocal, router]);

  useNotifications();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: PERSIST_MAX_AGE_MS,
        buster: QUERY_CACHE_BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: shouldPersistQuery,
        },
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider theme={paperTheme}>
          {!hydrated ? (
            <LoadingScreen message="Loading session…" />
          ) : (
            <View style={{ flex: 1 }}>
              <OfflineBanner />
              <BackgroundFetchIndicator />
              <View style={{ flex: 1 }}>
                <Slot />
              </View>
            </View>
          )}
        </PaperProvider>
      </GestureHandlerRootView>
    </PersistQueryClientProvider>
  );
}
