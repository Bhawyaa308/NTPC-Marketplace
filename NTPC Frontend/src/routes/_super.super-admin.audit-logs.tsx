import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "../components/common";
import { History } from "lucide-react";
import {
  fetchSuperAdminAuditLogs,
  type AuditLog,
} from "../services/super-admin.service";

export const Route = createFileRoute("/_super/super-admin/audit-logs")({ component: AuditLogs });

function formatTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [user, setUser] = useState("");
  const [date, setDate] = useState("");
  const [action, setAction] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLogs() {
      try {
        setError("");
        const data = await fetchSuperAdminAuditLogs({
          user: user || undefined,
          date: date || undefined,
          action: action || undefined,
        });
        setLogs(data.logs || []);
        setActions(data.actions || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to load audit logs.");
      }
    }

    void loadLogs();
  }, [user, date, action]);

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Chronological record of platform events." />
      {error ? <div className="ntpc-card p-4 text-sm text-red-600 mb-4">{error}</div> : null}
      <div className="ntpc-card p-5 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input placeholder="Filter by user" className="ntpc-input" value={user} onChange={(event) => setUser(event.target.value)} />
        <input type="date" className="ntpc-input" value={date} onChange={(event) => setDate(event.target.value)} />
        <select className="ntpc-input" value={action} onChange={(event) => setAction(event.target.value)}>
          <option value="">All event types</option>
          {actions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-5">
          {logs.map((l) => (
            <div key={l.audit_id} className="relative">
              <div className="absolute -left-[18px] top-2 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="ntpc-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><History size={14} className="text-muted-foreground" /><span className="font-semibold text-sm">{l.action}</span></div>
                  <div className="text-xs text-muted-foreground">{formatTime(l.created_at)}</div>
                </div>
                <div className="text-sm mt-1"><span className="font-medium">{l.user_name || "System"}</span> - <span className="text-muted-foreground">{l.role || "USER"} · {l.entity_type || "ENTITY"} {l.entity_id || ""}{l.ip_address ? ` · ${l.ip_address}` : ""}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
