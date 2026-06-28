import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, StatusBadge } from "../components/common";
import {
  fetchAllReports,
  updateReportStatus,
} from "../services/reports.service";

export const Route = createFileRoute("/_admin/admin/reports")({
  component: AdminReports,
});

type ReportItem = {
  report_id?: number | string;
  listing_id?: number | string;
  reason?: string;
  status?: string;
  created_at?: string;
  reporter_name?: string;
  listing_title?: string;
  seller_name?: string;
};

function AdminReports() {
  const [list, setList] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await fetchAllReports();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const update = async (id: string | number, status: string) => {
    try {
      await updateReportStatus(id, status);
      setList((arr) =>
        arr.map((r) =>
          String(r.report_id) === String(id) ? { ...r, status } : r,
        ),
      );
      await loadReports();
    } catch (err) {
      console.error("Failed to update report status", err);
    }
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Review and resolve user-submitted reports."
      />
      <div className="ntpc-card divide-y">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">
            Loading reports…
          </div>
        ) : list.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No reports yet.
          </div>
        ) : (
          list.map((r) => (
            <div
              key={String(r.report_id)}
              className="p-4 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">
                  {r.report_id} · {r.created_at}
                </div>
                <div className="font-semibold truncate">{r.reason}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {r.reporter_name || "Unknown reporter"} ·{" "}
                  {r.listing_title || `Listing #${r.listing_id}`}
                </div>
              </div>
              <StatusBadge status={r.status} />
              <button
                onClick={() => void update(r.report_id ?? "", "RESOLVED")}
                className="ntpc-btn-secondary !py-1 !px-2 text-xs text-emerald-700 hover:bg-emerald-50"
              >
                Resolve
              </button>
              <button
                onClick={() => void update(r.report_id ?? "", "REJECTED")}
                className="ntpc-btn-secondary !py-1 !px-2 text-xs text-red-600 hover:bg-red-50"
              >
                Reject
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
