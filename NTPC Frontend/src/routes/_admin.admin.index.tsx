import { createFileRoute } from "@tanstack/react-router";
import { Users, UserCheck, ListChecks, Flag } from "lucide-react";
import { PageHeader } from "../components/common";

export const Route = createFileRoute("/_admin/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  const cards = [
    { label: "Total Users", value: "1,284", icon: Users, trend: "+24 this week" },
    { label: "Active Users", value: "962", icon: UserCheck, trend: "75% active" },
    { label: "Active Listings", value: "318", icon: ListChecks, trend: "+12 today" },
    { label: "Open Reports", value: "7", icon: Flag, trend: "2 urgent" },
  ];
  const activity = [
    { who: "Priya Sharma", what: "reported a listing", when: "2m ago" },
    { who: "Anil Kumar", what: "created a new listing", when: "8m ago" },
    { who: "Sneha Iyer", what: "deactivated a user", when: "21m ago" },
    { who: "Rohan Mehta", what: "completed a transaction", when: "1h ago" },
    { who: "Vikram Singh", what: "edited their profile", when: "2h ago" },
  ];
  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Moderation overview across NTPC Marketplace." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="ntpc-card p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <div className="text-xs font-semibold">{c.label}</div>
              <c.icon size={16} className="text-primary" />
            </div>
            <div className="text-3xl font-bold mt-2">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.trend}</div>
          </div>
        ))}
      </div>
      <div className="ntpc-card mt-6 p-5">
        <h3 className="font-bold mb-3">Recent Activity</h3>
        <div className="divide-y">
          {activity.map((a, i) => (
            <div key={i} className="py-3 flex items-center justify-between text-sm">
              <div><span className="font-semibold">{a.who}</span> <span className="text-muted-foreground">{a.what}</span></div>
              <div className="text-xs text-muted-foreground">{a.when}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
