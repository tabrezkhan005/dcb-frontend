import { create } from "zustand";
import * as storage from "../services/storage";
import * as authApi from "../services/auth";
import type { User } from "../types/api.types";
import { registerForPushNotifications } from "../services/notifications";
import { clearQueryCacheAndPersistence } from "../lib/clearQueryPersistence";

interface Credentials {
  phone: string;
  password: string;
  deviceId: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  logoutLocal: () => Promise<void>;
  updateUser: (partial: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    try {
      const token = await storage.getAccessToken();
      const user = await storage.getUser();
      set({
        accessToken: token,
        user,
        isAuthenticated: Boolean(token !== null && user !== null),
      });
    } finally {
      set({ isHydrated: true });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(
        credentials.phone,
        credentials.password,
        credentials.deviceId,
      );
      await storage.saveToken(res.accessToken, res.refreshToken);
      const user: User = {
        id: res.user.id,
        name: res.user.name,
        role: res.user.role,
        districtId: res.user.districtId,
      };
      await storage.saveUser(user);
      set({
        user,
        accessToken: res.accessToken,
        isAuthenticated: true,
      });
      void registerForPushNotifications();
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch {
      /* still clear locally */
    } finally {
      await storage.clearAll();
      await clearQueryCacheAndPersistence();
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  logoutLocal: async () => {
    await storage.clearAll();
    await clearQueryCacheAndPersistence();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  updateUser: async (partial) => {
    const cur = get().user;
    if (cur === null) {
      return;
    }
    const next: User = { ...cur, ...partial };
    set({ user: next });
    await storage.saveUser(next);
  },
}));
