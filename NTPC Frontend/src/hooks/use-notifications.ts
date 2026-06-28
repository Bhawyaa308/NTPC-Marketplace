import { useCallback, useEffect, useMemo, useState } from "react";
import { getSocket } from "../lib/socket";
import { fetchNotifications } from "../services/notifications.service";

export type NotificationItem = {
  notification_id?: number | string;
  id?: number | string;
  user_id?: number | string;
  title?: string;
  message?: string;
  body?: string;
  type?: string;
  related_entity_type?: string;
  related_entity_id?: number | string;
  is_read?: boolean;
  created_at?: string;
};

function normalizeNotification(notification: NotificationItem): NotificationItem {
  return {
    ...notification,
    notification_id: notification.notification_id ?? notification.id,
    id: notification.id ?? notification.notification_id,
    message: notification.message ?? notification.body ?? "",
    is_read: Boolean(notification.is_read),
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchNotifications();
      const normalized = Array.isArray(data) ? data.map(normalizeNotification) : [];
      setNotifications(normalized);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadNotifications();
  }, [reloadNotifications]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNotification = (notification: NotificationItem) => {
      const normalized = normalizeNotification(notification);
      setNotifications((prev) => {
        const exists = prev.some(
          (item) =>
            String(item.notification_id ?? item.id) ===
            String(normalized.notification_id ?? normalized.id),
        );
        if (exists) return prev;
        return [normalized, ...prev];
      });
    };

    socket.on("notification", handleNotification);
    return () => {
      socket.off("notification", handleNotification);
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  );

  return {
    notifications,
    unreadCount,
    loading,
    reloadNotifications,
  };
}
