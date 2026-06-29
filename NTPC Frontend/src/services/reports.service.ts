import api from "../lib/api";

export async function fetchMyReports() {
  const res = await api.get("/reports/my");
  return res.data ?? [];
}

export async function getReportById(reportId: string | number) {
  const res = await api.get(`/reports/${reportId}`);
  return res.data;
}

export async function createReport(payload: { listing_id: string | number; reason: string }) {
  const res = await api.post("/reports", payload);
  return res.data;
}

export async function fetchAllReports() {
  const res = await api.get("/reports");
  return res.data ?? [];
}

export async function resolveReport(reportId: string | number) {
  const res = await api.patch(`/reports/${reportId}/resolve`);
  return res.data;
}

export async function rejectReport(reportId: string | number) {
  const res = await api.patch(`/reports/${reportId}/reject`);
  return res.data;
}

export async function withdrawReport(reportId: string | number) {
  const res = await api.patch(`/reports/${reportId}/withdraw`);
  return res.data;
}
