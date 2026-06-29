import api from "../lib/api";

function notifyChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("notifications:changed"));
  }
}

export async function fetchNotifications() {
  const res = await api.get("/notifications");
  return res.data ?? [];
}

export async function markNotificationRead(notificationId: string | number) {
  const res = await api.patch(`/notifications/${notificationId}/read`);
  notifyChanged();
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await api.patch("/notifications/read-all");
  notifyChanged();
  return res.data;
}
