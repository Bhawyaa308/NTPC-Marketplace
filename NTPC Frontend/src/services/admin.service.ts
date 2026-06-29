import api from "../lib/api";

export type AdminUser = {
  user_id: number;
  employee_id?: string;
  email?: string;
  name?: string;
  phone?: string;
  department_id?: number;
  department_name?: string;
  department?: string;
  designation?: string;
  township_id?: number;
  township_name?: string;
  township?: string;
  role_id?: string | number;
  role?: string;
  email_verified?: boolean;
  last_login?: string;
  is_active?: boolean;
  created_at?: string;
};

export type RecentActivity = {
  type: "LISTING" | "ORDER" | "REPORT";
  entity_id: string;
  actor?: string;
  description?: string;
  created_at?: string;
};

export type AdminDashboard = {
  total_users: number;
  total_listings: number;
  active_listings: number;
  reserved_listings: number;
  sold_listings: number;
  pending_reservations: number;
  pending_orders: number;
  paid_orders: number;
  total_reports: number;
  open_reports: number;
  total_notifications?: number;
  recent_activity: RecentActivity[];
};

export async function fetchAdminDashboard() {
  const res = await api.get("/admin/stats");
  return res.data as AdminDashboard;
}

export async function fetchAdminUsers() {
  const res = await api.get("/admin/users");
  return (res.data ?? []) as AdminUser[];
}

export async function activateAdminUser(userId: string | number) {
  const res = await api.patch(`/admin/users/${userId}/activate`);
  return res.data as AdminUser;
}

export async function deactivateAdminUser(userId: string | number) {
  const res = await api.patch(`/admin/users/${userId}/deactivate`);
  return res.data as AdminUser;
}
