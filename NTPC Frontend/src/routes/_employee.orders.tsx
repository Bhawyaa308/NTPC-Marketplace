import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, StatusBadge } from "../components/common";
import { fetchOrders } from "../services/orders.service";

const TABS = ["Pending", "Paid", "Completed", "Cancelled"];

export const Route = createFileRoute("/_employee/orders")({
  component: Orders,
});

function Orders() {
  const [tab, setTab] = useState("Pending");
  const [orders, setOrders] = useState<any[]>([]);

  const matchesTab = (status: string | undefined, tabLabel: string) =>
    (status ?? "").toString().toUpperCase() === tabLabel.toUpperCase();

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error("Orders fetch error:", err);
      setOrders([]);
    }
  }

  const normalizedTab = tab.toUpperCase();
  const list = orders.filter((o) => matchesTab(o.status, normalizedTab));
  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="All your purchases on NTPC Marketplace."
      />
      <div className="flex gap-1 border-b mb-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t}{" "}
            <span className="ml-1 text-xs text-muted-foreground">
              ({orders.filter((o) => matchesTab(o.status, t)).length})
            </span>
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {list.length === 0 && (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No {tab.toLowerCase()} orders.
          </div>
        )}
        {list.map((o) => (
          <div
            key={o.order_id}
            className="ntpc-card p-4 flex items-center gap-4"
          >
            <img
              src={o.listing?.image || ""}
              alt=""
              className="h-20 w-20 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">
                {o.order_id} · {o.date || ""}
              </div>
              <div className="font-semibold truncate">
                {o.listing?.title || ""}
              </div>
              <div className="text-sm text-muted-foreground">
                {o.listing?.seller?.name || ""} · {o.listing?.township || ""}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-primary">
                ₹{o.amount.toLocaleString("en-IN")}
              </div>
              <div className="mt-2">
                <StatusBadge status={o.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
