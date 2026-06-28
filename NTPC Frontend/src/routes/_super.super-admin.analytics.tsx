import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/common";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_super/super-admin/analytics")({ component: Analytics });

const bars = [40, 65, 50, 80, 72, 95, 88, 110, 102, 130, 118, 142];
const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function Analytics() {
  const max = Math.max(...bars);
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Marketplace, transfer, and growth metrics." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: "Monthly Active Users", value: "962", trend: "+12.4%" },
          { label: "Transfer Listings", value: "147", trend: "+8.1%" },
          { label: "Avg. Order Value", value: "₹6,820", trend: "+3.2%" },
        ].map((s) => (
          <div key={s.label} className="ntpc-card p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-3xl font-bold mt-1">{s.value}</div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><TrendingUp size={12} />{s.trend}</div>
          </div>
        ))}
      </div>
      <div className="ntpc-card p-5 mt-5">
        <h3 className="font-bold mb-1">Listings created — last 12 months</h3>
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
          {["Dadri", "Korba", "Singrauli", "Vindhyachal", "Ramagundam"].map((t, i) => (
            <div key={t} className="flex items-center gap-3 mb-2">
              <div className="w-24 text-sm">{t}</div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${90 - i * 14}%` }} /></div>
              <div className="text-xs text-muted-foreground w-10 text-right">{90 - i * 14}%</div>
            </div>
          ))}
        </div>
        <div className="ntpc-card p-5">
          <h3 className="font-bold mb-3">Transfer Corridors</h3>
          {[
            ["Dadri → Korba", 38], ["Singrauli → Vindhyachal", 27], ["Ramagundam → Talcher", 19], ["Sipat → Farakka", 11], ["Mouda → Solapur", 5],
          ].map(([t, v]) => (
            <div key={t as string} className="flex items-center gap-3 mb-2">
              <div className="w-44 text-sm truncate">{t}</div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-accent" style={{ width: `${(v as number) * 2.4}%` }} /></div>
              <div className="text-xs text-muted-foreground w-10 text-right">{v}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
