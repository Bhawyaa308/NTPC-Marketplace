import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Modal, PageHeader, StatusBadge } from "../components/common";
import {
  fetchAllReports,
  getReportById,
  rejectReport,
  resolveReport,
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
  resolved_at?: string;
  reporter_name?: string;
  listing_title?: string;
  seller_name?: string;
};

const finalStatuses = ["RESOLVED", "REJECTED", "WITHDRAWN"];

function AdminReports() {
  const [list, setList] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [updating, setUpdating] = useState(false);

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

  const openDetails = async (report: ReportItem) => {
    setSelectedReport(report);
    setDetailOpen(true);
    const reportId = report.report_id;
    if (reportId === undefined || reportId === null) return;

    try {
      const data = await getReportById(reportId);
      setSelectedReport(data);
    } catch (err) {
      console.error("Failed to load report details", err);
    }
  };

  const closeDetails = () => {
    setDetailOpen(false);
    setSelectedReport(null);
  };

  const update = async (id: string | number, status: "RESOLVED" | "REJECTED") => {
    try {
      setUpdating(true);
      const updated =
        status === "RESOLVED" ? await resolveReport(id) : await rejectReport(id);
      setList((arr) =>
        arr.map((report) =>
          String(report.report_id) === String(id) ? updated : report,
        ),
      );
      setSelectedReport(updated);
    } catch (err) {
      console.error("Failed to update report status", err);
    } finally {
      setUpdating(false);
    }
  };

  const canAct = (status?: string) =>
    !finalStatuses.includes(String(status || "").toUpperCase());

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Review and resolve user-submitted reports."
      />
      <div className="ntpc-card divide-y">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">
            Loading reports...
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
                  {r.report_id} -{" "}
                  {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                </div>
                <div className="font-semibold truncate">
                  {r.listing_title || `Listing #${r.listing_id}`}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {r.reporter_name || "Unknown reporter"} - {r.reason}
                </div>
              </div>
              <StatusBadge status={r.status} />
              <button
                onClick={() => void openDetails(r)}
                className="ntpc-btn-secondary !py-1 !px-2 text-xs"
              >
                Open
              </button>
              {canAct(r.status) ? (
                <>
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
                </>
              ) : null}
            </div>
          ))
        )}
      </div>

      <Modal
        open={detailOpen}
        onClose={closeDetails}
        title="Report Details"
        footer={
          <>
            <button className="ntpc-btn-secondary" onClick={closeDetails}>
              Close
            </button>
            {selectedReport && canAct(selectedReport.status) ? (
              <>
                <button
                  className="ntpc-btn-secondary text-emerald-700 hover:bg-emerald-50"
                  onClick={() =>
                    void update(selectedReport.report_id ?? "", "RESOLVED")
                  }
                  disabled={updating}
                >
                  Resolve
                </button>
                <button
                  className="ntpc-btn-secondary text-red-600 hover:bg-red-50"
                  onClick={() =>
                    void update(selectedReport.report_id ?? "", "REJECTED")
                  }
                  disabled={updating}
                >
                  Reject
                </button>
              </>
            ) : null}
          </>
        }
      >
        {selectedReport ? (
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-semibold mb-1">Report ID</div>
              <div>{selectedReport.report_id ?? "-"}</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Listing Title</div>
              <div>
                {selectedReport.listing_title ||
                  `Listing #${selectedReport.listing_id}`}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">Reported By</div>
              <div>{selectedReport.reporter_name ?? "-"}</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Reason</div>
              <div>{selectedReport.reason ?? "-"}</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Status</div>
              <StatusBadge status={selectedReport.status} />
            </div>
            <div>
              <div className="font-semibold mb-1">Created At</div>
              <div>
                {selectedReport.created_at
                  ? new Date(selectedReport.created_at).toLocaleString()
                  : "-"}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
