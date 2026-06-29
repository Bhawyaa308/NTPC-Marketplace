import api from "../lib/api";

export type SuperAdminActivity = {
  type: string;
  entity_id: string;
  actor?: string | null;
  description?: string | null;
  created_at?: string | null;
};

export type SuperAdminDashboard = {
  total_users: number;
  total_admins: number;
  total_employees: number;
  total_departments: number;
  total_townships: number;
  total_listings: number;
  active_listings: number;
  reserved_listings: number;
  sold_listings: number;
  total_reports: number;
  open_reports: number;
  pending_orders: number;
  paid_orders: number;
  recent_activity: SuperAdminActivity[];
};

export type Department = {
  department_id: number;
  department_name: string;
  description?: string | null;
  total_employees: number;
  created_at?: string | null;
};

export type Township = {
  township_id: number;
  name: string;
  state?: string | null;
  region?: string | null;
  total_employees: number;
  total_listings: number;
  created_at?: string | null;
};

export type AnalyticsPoint = {
  label: string;
  value: number;
};

export type SuperAdminAnalytics = {
  listings_by_category: AnalyticsPoint[];
  listings_by_status: AnalyticsPoint[];
  monthly_listings: AnalyticsPoint[];
  monthly_orders: AnalyticsPoint[];
  monthly_payments: AnalyticsPoint[];
  reports_by_status: AnalyticsPoint[];
  user_growth: AnalyticsPoint[];
  township_distribution: AnalyticsPoint[];
  department_distribution: AnalyticsPoint[];
};

export type AuditLog = {
  audit_id: number;
  user_id?: number | null;
  user_name?: string | null;
  role?: string | null;
  action?: string | null;
  entity_type?: string | null;
  entity_id?: string | number | null;
  created_at?: string | null;
  ip_address?: string | null;
};

export type PlatformSetting = {
  setting_key: string;
  setting_value: string;
  updated_at?: string | null;
};

export async function fetchSuperAdminDashboard() {
  const res = await api.get("/super-admin/dashboard");
  return res.data as SuperAdminDashboard;
}

export async function fetchSuperAdminAnalytics() {
  const res = await api.get("/super-admin/analytics");
  return res.data as SuperAdminAnalytics;
}

export async function fetchSuperAdminAuditLogs(params?: {
  user?: string;
  action?: string;
  date?: string;
}) {
  const res = await api.get("/super-admin/audit-logs", { params });
  return res.data as { logs: AuditLog[]; actions: string[] };
}

export async function fetchSuperAdminSettings() {
  const res = await api.get("/super-admin/settings");
  return (res.data ?? []) as PlatformSetting[];
}

export async function updateSuperAdminSetting(payload: {
  setting_key: string;
  setting_value: string;
}) {
  const res = await api.patch("/super-admin/settings", payload);
  return res.data as PlatformSetting;
}

export async function fetchSuperAdminDepartments() {
  const res = await api.get("/super-admin/departments");
  return (res.data ?? []) as Department[];
}

export async function createSuperAdminDepartment(payload: {
  department_name: string;
  description?: string;
}) {
  const res = await api.post("/super-admin/departments", payload);
  return res.data as Department;
}

export async function updateSuperAdminDepartment(
  departmentId: string | number,
  payload: { department_name: string; description?: string },
) {
  const res = await api.patch(`/super-admin/departments/${departmentId}`, payload);
  return res.data as Department;
}

export async function deleteSuperAdminDepartment(departmentId: string | number) {
  const res = await api.delete(`/super-admin/departments/${departmentId}`);
  return res.data as { message: string };
}

export async function fetchSuperAdminTownships() {
  const res = await api.get("/super-admin/townships");
  return (res.data ?? []) as Township[];
}

export async function createSuperAdminTownship(payload: {
  name: string;
  state?: string;
  region?: string;
}) {
  const res = await api.post("/super-admin/townships", payload);
  return res.data as Township;
}

export async function updateSuperAdminTownship(
  townshipId: string | number,
  payload: { name: string; state?: string; region?: string },
) {
  const res = await api.patch(`/super-admin/townships/${townshipId}`, payload);
  return res.data as Township;
}

export async function deleteSuperAdminTownship(townshipId: string | number) {
  const res = await api.delete(`/super-admin/townships/${townshipId}`);
  return res.data as { message: string };
}
