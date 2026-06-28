import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/common";
import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notifications.service";
import {
  useNotifications,
  type NotificationItem,
} from "../hooks/use-notifications";

export const Route = createFileRoute("/_employee/notifications")({
  component: Notifications,
});

function formatRelativeTime(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins <= 1) return "Just now";
  if (diffMins < 60) return `${diffMins} mins ago`;

  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hrs ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString();
}

function Notifications() {
  const { notifications, loading, reloadNotifications } = useNotifications();
  const [localNotifications, setLocalNotifications] = useState<
    NotificationItem[]
  >([]);
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const unread = useMemo(
    () => localNotifications.filter((n) => !n.is_read).length,
    [localNotifications],
  );

  async function handleMarkRead(notificationId: string | number) {
    try {
      setBusyId(notificationId);
      await markNotificationRead(notificationId);
      setBusyId(null);
      setLocalNotifications((prev) =>
        prev.map((notification) =>
          notification.notification_id === notificationId ||
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification,
        ),
      );
      await reloadNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    } finally {
      setBusyId(null);
    }
  }

  async function handleMarkAllRead() {
    try {
      setMarkingAll(true);
      await markAllNotificationsRead();
      setLocalNotifications((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true })),
      );
      await reloadNotifications();
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Latest activity across your marketplace account."
        action={
          <button
            onClick={() => void handleMarkAllRead()}
            disabled={unread === 0 || markingAll}
            className="ntpc-btn-secondary disabled:opacity-50"
          >
            <CheckCheck size={14} /> Mark all as read
          </button>
        }
      />
      <div className="space-y-3">
        {loading ? (
          <div className="ntpc-card p-4 text-sm text-muted-foreground">
            Loading notifications…
          </div>
        ) : localNotifications.length === 0 ? (
          <div className="ntpc-card p-4 text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          localNotifications.map((notification) => {
            const id = notification.notification_id ?? notification.id;
            if (id === undefined) return null;
            const unreadState = !notification.is_read;
            return (
              <div
                key={String(id)}
                className={`ntpc-card p-4 flex gap-3 ${unreadState ? "border-l-4 border-l-accent" : "opacity-80"}`}
              >
                <div className="h-9 w-9 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <Bell size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-sm truncate">
                      {notification.title}
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {formatRelativeTime(notification.created_at)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {notification.message}
                  </div>
                </div>
                {unreadState ? (
                  <button
                    onClick={() => void handleMarkRead(id)}
                    disabled={busyId === id}
                    className="text-[10px] bg-accent text-white font-bold px-2 py-0.5 rounded-full h-fit hover:bg-orange-600 disabled:opacity-60"
                  >
                    {busyId === id ? "Working…" : "Mark read"}
                  </button>
                ) : (
                  <span className="text-[10px] text-muted-foreground h-fit">
                    Read
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
