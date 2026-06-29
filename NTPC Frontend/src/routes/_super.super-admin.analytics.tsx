import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "../components/common";
import { TrendingUp } from "lucide-react";
import {
  fetchSuperAdminAnalytics,
  type AnalyticsPoint,
  type SuperAdminAnalytics,
} from "../services/super-admin.service";

export const Route = createFileRoute("/_super/super-admin/analytics")({ component: Analytics });

function valueSum(points?: AnalyticsPoint[]) {
  return (points || []).reduce((sum, point) => sum + Number(point.value || 0), 0);
}

function topPoints(points?: AnalyticsPoint[]) {
  return (points || []).slice(0, 5);
}

function Analytics() {
  const [analytics, setAnalytics] = useState<SuperAdminAnalytics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setError("");
        setAnalytics(await fetchSuperAdminAnalytics());
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to load analytics.");
      }
    }

    void loadAnalytics();
  }, []);

  const bars = analytics?.monthly_listings?.length ? analytics.monthly_listings.map((point) => Number(point.value || 0)) : [0];
  const months = analytics?.monthly_listings?.length ? analytics.monthly_listings.map((point) => point.label) : ["-"];
  const max = Math.max(...bars, 1);
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Marketplace, transfer, and growth metrics." />
      {error ? <div className="ntpc-card p-4 text-sm text-red-600 mb-4">{error}</div> : null}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: "Monthly Active Users", value: valueSum(analytics?.user_growth).toLocaleString("en-IN"), trend: `${valueSum(analytics?.department_distribution).toLocaleString("en-IN")} users` },
          { label: "Transfer Listings", value: valueSum(analytics?.listings_by_status).toLocaleString("en-IN"), trend: `${valueSum(analytics?.reports_by_status).toLocaleString("en-IN")} reports` },
          { label: "Avg. Order Value", value: `Rs ${Math.round(valueSum(analytics?.monthly_payments) / Math.max(valueSum(analytics?.monthly_orders), 1)).toLocaleString("en-IN")}`, trend: `${valueSum(analytics?.monthly_orders).toLocaleString("en-IN")} orders` },
        ].map((s) => (
          <div key={s.label} className="ntpc-card p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-3xl font-bold mt-1">{s.value}</div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><TrendingUp size={12} />{s.trend}</div>
          </div>
        ))}
      </div>
      <div className="ntpc-card p-5 mt-5">
        <h3 className="font-bold mb-1">Listings created - last 12 months</h3>
        <p className="text-xs text-muted-foreground mb-4">Growth across all townships</p>
        <div className="flex items-end gap-2 h-56">
          {bars.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-gradient-to-t from-primary to-[#0a5cad] rounded-t" style={{ height: `${(b / max) * 100}%` }} />
              <div className="text-[10px] text-muted-foreground">{months[i]}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
        <div className="ntpc-card p-5">
          <h3 className="font-bold mb-3">Top Townships by Activity</h3>
          {topPoints(analytics?.township_distribution).map((point) => (
            <div key={point.label} className="flex items-center gap-3 mb-2">
              <div className="w-24 text-sm">{point.label}</div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${(Number(point.value || 0) / Math.max(valueSum(analytics?.township_distribution), 1)) * 100}%` }} /></div>
              <div className="text-xs text-muted-foreground w-10 text-right">{point.value}</div>
            </div>
          ))}
        </div>
        <div className="ntpc-card p-5">
          <h3 className="font-bold mb-3">Transfer Corridors</h3>
          {topPoints(analytics?.department_distribution).map((point) => (
            <div key={point.label} className="flex items-center gap-3 mb-2">
              <div className="w-44 text-sm truncate">{point.label}</div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-accent" style={{ width: `${(Number(point.value || 0) / Math.max(valueSum(analytics?.department_distribution), 1)) * 100}%` }} /></div>
              <div className="text-xs text-muted-foreground w-10 text-right">{point.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
