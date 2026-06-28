import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Truck,
  ArrowRight,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  Package,
} from "lucide-react";
import { ListingCard } from "../components/ListingCard";
import { PageHeader } from "../components/common";
import api from "../lib/api";

export const Route = createFileRoute("/_employee/transfers")({
  component: Transfers,
});

function Transfers() {
  const [from, setFrom] = useState("All");
  const [to, setTo] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [townships, setTownships] = useState<string[]>([]);

  const loadTransfers = async (currentFrom = from, currentTo = to) => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};
      if (currentFrom && currentFrom !== "All") params.from = currentFrom;
      if (currentTo && currentTo !== "All") params.to = currentTo;

      const response = await api.get("/transfers", { params });
      const payload = response.data || {};
      const transferListings = payload.listings || [];

      setStats([
        {
          label: "Transferring Employees",
          value: payload.stats?.transferringEmployees ?? 0,
          icon: Users,
        },
        {
          label: "Active Transfer Listings",
          value: payload.stats?.activeTransferListings ?? 0,
          icon: Package,
        },
        {
          label: "Townships Involved",
          value: payload.stats?.townshipsInvolved ?? 0,
          icon: MapPin,
        },
        {
          label: "Avg. Time to Move",
          value:
            payload.stats?.averageMoveDays == null
              ? "—"
              : `${payload.stats.averageMoveDays} days`,
          icon: Calendar,
        },
      ]);
      setEmployees(payload.employees || []);
      setListings(transferListings);
      setInsights(payload.insights || null);
      setTownships(
        Array.from(
          new Set([
            ...(transferListings || []).map((listing: any) => listing.township),
            ...(payload.employees || []).map((employee: any) => employee.from),
            ...(payload.employees || []).map((employee: any) => employee.to),
          ]),
        ) as string[],
      );
    } catch (err: any) {
      console.error("Transfers fetch error:", err);
      setError(
        err?.response?.data?.error || "Unable to load transfer data right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  const filtered = listings;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-orange-600 text-white p-6 sm:p-10">
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <Truck size={260} />
        </div>
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-3 py-1 text-xs font-semibold">
            <Truck size={14} /> Transfer Marketplace · Hero Feature
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-3">
            Help colleagues, find great deals.
          </h1>
          <p className="mt-2 opacity-95 text-sm sm:text-base max-w-xl">
            Employees moving to a new township list furniture, electronics,
            vehicles & more. Discover items from people transferring in or out
            of your township.
          </p>
        </div>
      </section>

      <section className="ntpc-card p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] items-end gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Current Township
            </label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="ntpc-input mt-1"
            >
              <option>All</option>
              {townships.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <ArrowRight
            className="hidden sm:block text-muted-foreground mb-2"
            size={18}
          />
          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Destination Township
            </label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="ntpc-input mt-1"
            >
              <option>All</option>
              {townships.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="ntpc-btn-primary justify-center"
            onClick={() => loadTransfers(from, to)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Apply"}
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="ntpc-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <s.icon size={16} className="text-primary" />
            </div>
            <div className="text-2xl font-bold mt-2">{s.value}</div>
          </div>
        ))}
      </section>

      <section>
        <PageHeader
          title="Employees Transferring Soon"
          subtitle="Connect early — these colleagues are moving out of your township."
        />
        {loading ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            Loading transfer employees…
          </div>
        ) : employees.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            No active transfers match the current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((e) => (
              <div key={e.id} className="ntpc-card p-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    {e.name
                      .split(" ")
                      .map((p: string) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{e.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {e.designation} · {e.department}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="font-medium">{e.from}</span>
                  <ArrowRight size={14} className="text-muted-foreground" />
                  <span className="font-medium text-primary">{e.to}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    <Calendar size={12} className="inline mr-1" />
                    Moves {e.movingOn}
                  </span>
                  <span>
                    <Package size={12} className="inline mr-1" />
                    {e.listings} listings
                  </span>
                </div>
                <Link
                  to="/transfers/$empId"
                  params={{ empId: String(e.id) }}
                  className="ntpc-btn-secondary w-full justify-center mt-3"
                >
                  View Listings
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <PageHeader
          title="Transfer Listings"
          subtitle={`${filtered.length} items from employees on the move`}
        />
        {loading ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            Loading transfer listings…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            No transfer listings are available for the current selection.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((l) => (
              <ListingCard key={l.listing_id} listing={l} />
            ))}
          </div>
        )}
      </section>

      <section className="ntpc-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-primary" />
          <h3 className="font-bold">Township Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">
              Most active transfer corridor
            </div>
            <div className="font-semibold mt-1">
              {insights?.mostActiveCorridor || "—"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">
              Top category in transfers
            </div>
            <div className="font-semibold mt-1">
              {insights?.topCategory ? `${insights.topCategory}` : "—"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Avg. listing close time</div>
            <div className="font-semibold mt-1">
              {insights?.averageListingCloseTime == null
                ? "—"
                : `${insights.averageListingCloseTime} days`}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
