import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2,
  Flag,
  ListChecks,
  Map,
  Shield,
  ShoppingBag,
  Users,
} from "lucide-react";
import { PageHeader } from "../components/common";
import {
  fetchSuperAdminDashboard,
  type SuperAdminActivity,
  type SuperAdminDashboard,
} from "../services/super-admin.service";

export const Route = createFileRoute("/_super/super-admin/")({ component: SuperDashboard });

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActivityRow({ activity }: { activity: SuperAdminActivity }) {
  return (
    <div className="py-2.5 flex items-center justify-between text-sm">
      <div>
        <span className="font-semibold">{activity.actor || activity.type}</span>{" "}
        <span className="text-muted-foreground">{activity.description || "updated platform data"}</span>
      </div>
      <div className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</div>
    </div>
  );
}

function SuperDashboard() {
  const [dashboard, setDashboard] = useState<SuperAdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        setDashboard(await fetchSuperAdminDashboard());
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const cards = [
    { label: "Total Users", value: dashboard?.total_users, icon: Users },
    { label: "Total Admins", value: dashboard?.total_admins, icon: Shield },
    { label: "Total Employees", value: dashboard?.total_employees, icon: Users },
    { label: "Total Departments", value: dashboard?.total_departments, icon: Building2 },
    { label: "Total Townships", value: dashboard?.total_townships, icon: Map },
    { label: "Total Listings", value: dashboard?.total_listings, icon: ListChecks },
    { label: "Active Listings", value: dashboard?.active_listings, icon: ListChecks },
    { label: "Reserved Listings", value: dashboard?.reserved_listings, icon: ListChecks },
    { label: "Sold Listings", value: dashboard?.sold_listings, icon: ShoppingBag },
    { label: "Total Reports", value: dashboard?.total_reports, icon: Flag },
    { label: "Open Reports", value: dashboard?.open_reports, icon: Flag },
    { label: "Pending Orders", value: dashboard?.pending_orders, icon: ShoppingBag },
    { label: "Paid Orders", value: dashboard?.paid_orders, icon: ShoppingBag },
  ];

  return (
    <div>
      <PageHeader title="Super Admin Dashboard" subtitle="Platform governance and high-level insights." />
      {error ? <div className="ntpc-card p-4 text-sm text-red-600 mb-4">{error}</div> : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="ntpc-card p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <div className="text-xs font-semibold">{card.label}</div>
              <card.icon size={16} className="text-primary" />
            </div>
            <div className="text-3xl font-bold mt-2">
              {loading ? "..." : Number(card.value || 0).toLocaleString("en-IN")}
            </div>
          </div>
        ))}
      </div>

      <div className="ntpc-card p-5 mt-6">
        <h3 className="font-bold mb-3">Recent Activity</h3>
        <div className="divide-y">
          {loading ? (
            <div className="py-3 text-sm text-muted-foreground">Loading activity...</div>
          ) : dashboard?.recent_activity?.length ? (
            dashboard.recent_activity.map((activity, index) => (
              <ActivityRow key={`${activity.type}-${activity.entity_id}-${index}`} activity={activity} />
            ))
          ) : (
            <div className="py-3 text-sm text-muted-foreground">No recent activity.</div>
          )}
        </div>
      </div>
    </div>
  );
}
