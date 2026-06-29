import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  ClipboardList,
  CreditCard,
  Flag,
  ListChecks,
  PackageCheck,
  ShoppingBag,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/common";
import {
  fetchAdminDashboard,
  type AdminDashboard,
} from "../services/admin.service";

export const Route = createFileRoute("/_admin/admin/")({
  component: AdminDashboardPage,
});

function formatNumber(value?: number) {
  return Number(value || 0).toLocaleString("en-IN");
}

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
  return date.toLocaleDateString();
}

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        setDashboard(await fetchAdminDashboard());
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to load dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const cards = useMemo(
    () => [
      {
        label: "Total Users",
        value: dashboard?.total_users,
        icon: Users,
        trend: "Registered accounts",
      },
      {
        label: "Total Listings",
        value: dashboard?.total_listings,
        icon: ListChecks,
        trend: "All marketplace listings",
      },
      {
        label: "Active Listings",
        value: dashboard?.active_listings,
        icon: UserCheck,
        trend: "Currently visible",
      },
      {
        label: "Reserved Listings",
        value: dashboard?.reserved_listings,
        icon: ClipboardList,
        trend: "Reserved inventory",
      },
      {
        label: "Sold Listings",
        value: dashboard?.sold_listings,
        icon: PackageCheck,
        trend: "Completed listing status",
      },
      {
        label: "Pending Reservations",
        value: dashboard?.pending_reservations,
        icon: ClipboardList,
        trend: "Awaiting seller action",
      },
      {
        label: "Pending Orders",
        value: dashboard?.pending_orders,
        icon: ShoppingBag,
        trend: "Awaiting payment",
      },
      {
        label: "Paid Orders",
        value: dashboard?.paid_orders,
        icon: CreditCard,
        trend: "Payment completed",
      },
      {
        label: "Total Reports",
        value: dashboard?.total_reports,
        icon: Flag,
        trend: "All submitted reports",
      },
      {
        label: "Open Reports",
        value: dashboard?.open_reports,
        icon: Flag,
        trend: "Needs admin review",
      },
      {
        label: "Total Notifications",
        value: dashboard?.total_notifications,
        icon: Bell,
        trend: "Platform notifications",
      },
    ],
    [dashboard],
  );

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Moderation overview across NTPC Marketplace."
      />
      {error ? (
        <div className="ntpc-card p-4 text-sm text-red-600 mb-4">{error}</div>
      ) : null}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="ntpc-card p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <div className="text-xs font-semibold">{c.label}</div>
              <c.icon size={16} className="text-primary" />
            </div>
            <div className="text-3xl font-bold mt-2">
              {loading ? "..." : formatNumber(c.value)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{c.trend}</div>
          </div>
        ))}
      </div>
      <div className="ntpc-card mt-6 p-5">
        <h3 className="font-bold mb-3">Recent Activity</h3>
        {loading ? (
          <div className="py-3 text-sm text-muted-foreground">
            Loading activity...
          </div>
        ) : !dashboard?.recent_activity?.length ? (
          <div className="py-3 text-sm text-muted-foreground">
            No recent activity.
          </div>
        ) : (
          <div className="divide-y">
            {dashboard.recent_activity.map((a) => (
              <div
                key={`${a.type}-${a.entity_id}-${a.created_at}`}
                className="py-3 flex items-center justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <span className="font-semibold">{a.actor || "System"}</span>{" "}
                  <span className="text-muted-foreground">
                    {a.description}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  {formatRelativeTime(a.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
