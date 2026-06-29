import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader, StatusBadge } from "../components/common";
import { useNotifications, type NotificationItem } from "../hooks/use-notifications";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notifications.service";

export const Route = createFileRoute("/_admin/admin/notifications")({ component: AdminNotifications });

function formatTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminNotifications() {
  const { notifications, loading, reloadNotifications } = useNotifications();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(notifications);
  }, [notifications]);

  async function markRead(notification: NotificationItem) {
    const id = notification.notification_id ?? notification.id;
    if (!id || updatingId) return;
    try {
      setUpdatingId(id);
      setError("");
      setItems((current) =>
        current.map((item) =>
          String(item.notification_id ?? item.id) === String(id) ? { ...item, is_read: true } : item,
        ),
      );
      await markNotificationRead(id);
      await reloadNotifications();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Unable to mark notification as read.");
      await reloadNotifications();
    } finally {
      setUpdatingId(null);
    }
  }

  async function markAllRead() {
    try {
      setMarkingAll(true);
      setError("");
      setItems((current) => current.map((item) => ({ ...item, is_read: true })));
      await markAllNotificationsRead();
      await reloadNotifications();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Unable to mark notifications as read.");
      await reloadNotifications();
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Admin Notifications"
        subtitle="Moderation alerts and system events."
        action={
          <button className="ntpc-btn-secondary" onClick={() => void markAllRead()} disabled={markingAll || items.every((item) => item.is_read)}>
            {markingAll ? "Updating..." : "Mark all as read"}
          </button>
        }
      />
      {error ? <div className="ntpc-card p-4 text-sm text-red-600 mb-4">{error}</div> : null}
      <div className="space-y-3">
        {loading ? (
          <div className="ntpc-card p-4 text-sm text-muted-foreground">Loading notifications...</div>
        ) : items.length === 0 ? (
          <div className="ntpc-card p-4 text-sm text-muted-foreground">No notifications yet.</div>
        ) : (
          items.map((notification) => {
            const id = notification.notification_id ?? notification.id;
            return (
              <div key={id} className="ntpc-card p-4 flex gap-3">
                <div className="h-9 w-9 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0"><Bell size={16} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold text-sm">{notification.title || "Notification"}</div>
                    <StatusBadge status={notification.is_read ? "Read" : "Unread"} />
                  </div>
                  <div className="text-sm text-muted-foreground">{notification.message || notification.body || "-"}</div>
                  <div className="text-xs text-muted-foreground mt-1">{notification.type || "-"}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-muted-foreground">{formatTime(notification.created_at)}</div>
                  {!notification.is_read ? (
                    <button
                      className="ntpc-btn-secondary !py-1 !px-2 text-xs mt-2"
                      onClick={() => void markRead(notification)}
                      disabled={updatingId === id}
                    >
                      {updatingId === id ? "Updating..." : "Mark as Read"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
