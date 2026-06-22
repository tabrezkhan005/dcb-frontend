import { create } from "zustand";

interface NotificationState {
  unreadCount: number;
  lastNotification: string | null;
  incrementUnread: () => void;
  resetUnread: () => void;
  setLastNotification: (payload: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  lastNotification: null,
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
  setLastNotification: (payload) => set({ lastNotification: payload }),
}));
