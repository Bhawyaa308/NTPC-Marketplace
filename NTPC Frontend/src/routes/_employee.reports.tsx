import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, StatusBadge, Modal } from "../components/common";
import { Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";
import {
  createReport,
  fetchMyReports,
  withdrawReport,
} from "../services/reports.service";

export const Route = createFileRoute("/_employee/reports")({
  component: Reports,
});

type ReportItem = {
  report_id?: number | string;
  listing_id?: number | string;
  reason?: string;
  status?: string;
  created_at?: string;
};

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

function Reports() {
  const search = useSearch({ strict: false }) as {
    listing_id?: string | number;
  };
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [done, setDone] = useState(false);
  const [listingId, setListingId] = useState<string>(
    search.listing_id ? String(search.listing_id) : "",
  );
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await fetchMyReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const submit = async () => {
    if (!listingId.trim() || !reason.trim() || reason.trim().length < 10) {
      setError(
        "Please enter a valid listing ID and a reason with at least 10 characters.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await createReport({ listing_id: listingId, reason: reason.trim() });
      setDone(true);
      setListingId("");
      setReason("");
      await loadReports();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Unable to submit report right now.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    setOpen(false);
    setDone(false);
    setError("");
    setListingId(search.listing_id ? String(search.listing_id) : "");
    setReason("");
  };

  const openDetails = (report: ReportItem) => {
    setSelectedReport(report);
    setDetailOpen(true);
  };

  const closeDetails = () => {
    setDetailOpen(false);
    setSelectedReport(null);
    setError("");
  };

  const handleWithdraw = async () => {
    const reportId = selectedReport?.report_id;
    if (reportId === undefined || reportId === null) return;

    try {
      setWithdrawing(true);
      setError("");
      await withdrawReport(reportId);
      await loadReports();
      closeDetails();
      toast.success("Report withdrawn successfully.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Unable to withdraw report right now.",
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const heading = useMemo(
    () => (reports.length > 0 ? "My Reports" : "No reports yet"),
    [reports.length],
  );

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Help keep the marketplace safe and trustworthy."
        action={
          <button
            onClick={() => {
              setDone(false);
              setOpen(true);
            }}
            className="ntpc-btn-primary"
          >
            <Plus size={16} /> New Report
          </button>
        }
      />
      <div className="ntpc-card divide-y">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">
            Loading reports…
          </div>
        ) : reports.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No reports yet.
          </div>
        ) : (
          reports.map((r) => (
            <div
              key={String(r.report_id ?? r.listing_id)}
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/40"
              onClick={() => openDetails(r)}
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">
                  {r.report_id} · {formatRelativeTime(r.created_at)}
                </div>
                <div className="font-semibold truncate">{r.reason}</div>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))
        )}
      </div>
      <Toaster position="top-right" />
      <Modal
        open={open}
        onClose={close}
        title={done ? "Report Submitted" : "Submit New Report"}
        footer={
          done ? (
            <button className="ntpc-btn-primary" onClick={close}>
              Close
            </button>
          ) : (
            <>
              <button className="ntpc-btn-secondary" onClick={close}>
                Cancel
              </button>
              <button
                className="ntpc-btn-primary"
                onClick={() => void submit()}
                disabled={submitting}
              >
                Submit
              </button>
            </>
          )
        }
      >
        {done ? (
          <div className="flex gap-3 text-sm items-start">
            <CheckCircle2 className="text-emerald-600 mt-0.5" size={18} />
            <div>
              Your report has been recorded and added to{" "}
              <strong>My Reports</strong> with status <em>Open</em>.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm">
              <div className="font-semibold mb-1">Listing ID</div>
              <input
                value={listingId}
                onChange={(e) => setListingId(e.target.value)}
                className="ntpc-input"
                placeholder="Listing ID"
              />
            </label>
            <label className="block text-sm">
              <div className="font-semibold mb-1">Reason</div>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="ntpc-input"
                placeholder="Describe the issue"
              />
            </label>
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
          </div>
        )}
      </Modal>
      <Modal
        open={detailOpen}
        onClose={closeDetails}
        title="Report Details"
        footer={
          <button className="ntpc-btn-secondary" onClick={closeDetails}>
            Close
          </button>
        }
      >
        {selectedReport ? (
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-semibold mb-1">Listing ID</div>
              <div>{selectedReport.listing_id ?? "—"}</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Reason</div>
              <div>{selectedReport.reason ?? "—"}</div>
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
                  : "—"}
              </div>
            </div>
            {String(selectedReport.status || "").toUpperCase() === "OPEN" ? (
              <div className="pt-2">
                <button
                  className="ntpc-btn-primary"
                  onClick={() => void handleWithdraw()}
                  disabled={withdrawing}
                >
                  {withdrawing ? "Withdrawing..." : "Withdraw Report"}
                </button>
              </div>
            ) : null}
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
