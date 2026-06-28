import { createFileRoute } from "@tanstack/react-router";
import { AUDIT_LOGS } from "../data/mock";
import { PageHeader } from "../components/common";
import { History } from "lucide-react";

export const Route = createFileRoute("/_super/super-admin/audit-logs")({ component: AuditLogs });

function AuditLogs() {
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Chronological record of platform events." />
      <div className="ntpc-card p-5 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input placeholder="Filter by user" className="ntpc-input" />
        <input type="date" className="ntpc-input" />
        <select className="ntpc-input">
          <option>All event types</option><option>LOGIN</option><option>LISTING_CREATED</option><option>USER_DEACTIVATED</option><option>REPORT_RESOLVED</option>
        </select>
      </div>
      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-5">
          {AUDIT_LOGS.map((l) => (
            <div key={l.id} className="relative">
              <div className="absolute -left-[18px] top-2 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="ntpc-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><History size={14} className="text-muted-foreground" /><span className="font-semibold text-sm">{l.event}</span></div>
                  <div className="text-xs text-muted-foreground">{l.time}</div>
                </div>
                <div className="text-sm mt-1"><span className="font-medium">{l.actor}</span> — <span className="text-muted-foreground">{l.detail}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
