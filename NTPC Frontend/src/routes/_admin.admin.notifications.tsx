import { createFileRoute } from "@tanstack/react-router";
import { NOTIFICATIONS } from "../data/mock";
import { PageHeader } from "../components/common";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/notifications")({ component: AdminNotifications });

function AdminNotifications() {
  return (
    <div>
      <PageHeader title="Admin Notifications" subtitle="Moderation alerts and system events." />
      <div className="space-y-3">
        {NOTIFICATIONS.concat(NOTIFICATIONS).map((n, i) => (
          <div key={i} className="ntpc-card p-4 flex gap-3">
            <div className="h-9 w-9 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0"><Bell size={16} /></div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{n.title}</div>
              <div className="text-sm text-muted-foreground">{n.body}</div>
            </div>
            <div className="text-xs text-muted-foreground">{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
