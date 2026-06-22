import { useEffect } from "react";
import {
  addNotificationListener,
  addResponseListener,
  getInitialNotification,
  setupNotificationHandler,
} from "../services/notifications";
import { useNotificationStore } from "../stores/notificationStore";
import { useAuthStore } from "../stores/authStore";
import {
  navigateFromPushPayload,
  type PushPayload,
} from "../utils/notificationRouting";

export function useNotifications(): { unreadCount: number } {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const increment = useNotificationStore((s) => s.incrementUnread);
  const reset = useNotificationStore((s) => s.resetUnread);
  const setLast = useNotificationStore((s) => s.setLastNotification);
  const role = useAuthStore((s) => s.user?.role);

  useEffect(() => {
    setupNotificationHandler();

    const handlePayload = (data: PushPayload) => {
      navigateFromPushPayload(role, data);
    };

    const sub1 = addNotificationListener((n) => {
      increment();
      setLast(JSON.stringify(n.request.content.data ?? {}));
    });
    const sub2 = addResponseListener((r) => {
      reset();
      const data = r.notification.request.content.data as PushPayload | undefined;
      if (data !== undefined) {
        handlePayload(data);
      }
    });
    void getInitialNotification().then((r) => {
      if (r === null) {
        return;
      }
      const data = r.notification.request.content.data as PushPayload | undefined;
      if (data !== undefined) {
        handlePayload(data);
      }
    });
    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, [increment, reset, setLast, role]);

  return { unreadCount };
}
