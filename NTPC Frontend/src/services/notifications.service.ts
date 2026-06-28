import api from "../lib/api";

export async function fetchNotifications() {
  const res = await api.get("/notifications");
  return res.data ?? [];
}

export async function markNotificationRead(notificationId: string | number) {
  const res = await api.patch(`/notifications/${notificationId}/read`);
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await api.patch("/notifications/read-all");
  return res.data;
}
