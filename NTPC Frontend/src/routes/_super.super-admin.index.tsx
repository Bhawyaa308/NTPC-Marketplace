import { createFileRoute } from "@tanstack/react-router";
import { Users, Shield, Building2, Map, ListChecks, Truck, ShoppingBag, IndianRupee, Flag, TrendingUp } from "lucide-react";
import { PageHeader } from "../components/common";

export const Route = createFileRoute("/_super/super-admin/")({ component: SuperDashboard });

function SuperDashboard() {
  const cards = [
    { label: "Total Employees", value: "1,284", icon: Users },
    { label: "Total Admins", value: "18", icon: Shield },
    { label: "Total Listings", value: "3,612", icon: ListChecks },
    { label: "Active Listings", value: "412", icon: Building2 },
    { label: "Active Transfers", value: "147", icon: Truck },
    { label: "Orders (30d)", value: "284", icon: ShoppingBag },
    { label: "Revenue (30d)", value: "₹38.4L", icon: IndianRupee },
    { label: "Open Reports", value: "7", icon: Flag },
  ];

  const catBars = [
    { label: "Electronics", value: 32 },
    { label: "Furniture", value: 28 },
    { label: "Appliances", value: 18 },
    { label: "Vehicles", value: 12 },
    { label: "Books", value: 6 },
    { label: "Others", value: 4 },
  ];
  const corridors = [
    ["Dadri → Korba", 38], ["Singrauli → Vindhyachal", 27], ["Ramagundam → Talcher", 19], ["Sipat → Farakka", 11], ["Mouda → Solapur", 5],
  ] as const;
  const monthBars = [40, 65, 50, 80, 72, 95, 88, 110, 102, 130, 118, 142];
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const maxMonth = Math.max(...monthBars);

  const activity = [
    { who: "Priya Sharma", what: "approved a reservation", when: "2m ago" },
    { who: "Anil Kumar", what: "created a new listing", when: "8m ago" },
    { who: "Sneha Iyer", what: "deactivated a user", when: "21m ago" },
    { who: "Rohan Mehta", what: "completed a transaction", when: "1h ago" },
    { who: "Vikram Singh", what: "edited their profile", when: "2h ago" },
  ];

  return (
    <div>
      <PageHeader title="Super Admin Dashboard" subtitle="Platform governance and high-level insights." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="ntpc-card p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <div className="text-xs font-semibold">{c.label}</div><c.icon size={16} className="text-primary" />
            </div>
            <div className="text-3xl font-bold mt-2">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="ntpc-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold">Orders by Month</h3>
            <span className="text-xs text-emerald-600 inline-flex items-center gap-1"><TrendingUp size={12} /> +12.4%</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Marketplace activity across the last 12 months</p>
          <div className="flex items-end gap-2 h-48">
            {monthBars.map((b, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gradient-to-t from-primary to-[#0a5cad] rounded-t" style={{ height: `${(b / maxMonth) * 100}%` }} />
                <div className="text-[10px] text-muted-foreground">{months[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ntpc-card p-5">
          <h3 className="font-bold mb-3">Listings by Category</h3>
          {catBars.map((c) => (
            <div key={c.label} className="mb-2">
              <div className="flex justify-between text-xs mb-1"><span>{c.label}</span><span className="text-muted-foreground">{c.value}%</span></div>
              <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${c.value * 3}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="ntpc-card p-5">
          <h3 className="font-bold mb-3">Transfers by Township Corridor</h3>
          {corridors.map(([t, v]) => (
            <div key={t} className="flex items-center gap-3 mb-2">
              <div className="w-48 text-sm truncate">{t}</div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-accent" style={{ width: `${v * 2.4}%` }} /></div>
              <div className="text-xs text-muted-foreground w-10 text-right">{v}%</div>
            </div>
          ))}
        </div>
        <div className="ntpc-card p-5">
          <h3 className="font-bold mb-3">Recent Activity</h3>
          <div className="divide-y">
            {activity.map((a, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-sm">
                <div><span className="font-semibold">{a.who}</span> <span className="text-muted-foreground">{a.what}</span></div>
                <div className="text-xs text-muted-foreground">{a.when}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
