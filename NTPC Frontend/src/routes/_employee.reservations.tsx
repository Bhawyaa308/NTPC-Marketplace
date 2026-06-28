import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, StatusBadge } from "../components/common";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  fetchReservations,
  approveReservation,
  rejectReservation,
} from "../services/reservations.service";
import { getAuth } from "../lib/auth";
export const Route = createFileRoute("/_employee/reservations")({
  component: Reservations,
});

const TABS = ["Incoming (Seller)", "My Requests"];

function Reservations() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [tab, setTab] = useState(TABS[0]);

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    try {
      const data = await fetchReservations();
      setReservations(data);
    } catch (err) {
      console.error("Reservations fetch error:", err);
      setReservations([]);
    }
  }

  async function handleApprove(id: string | number) {
    try {
      await approveReservation(id);
      await loadReservations();
    } catch (err) {
      console.error("Approve reservation error:", err);
    }
  }

  async function handleReject(id: string | number) {
    try {
      await rejectReservation(id);
      await loadReservations();
    } catch (err) {
      console.error("Reject reservation error:", err);
    }
  }

  const incoming = reservations.filter(
    (r: any) => r.seller_id === getAuth()?.user.user_id,
  );
  const mine = reservations.filter(
    (r: any) => r.buyer_id === getAuth()?.user.user_id,
  );
  const list = tab === TABS[0] ? incoming : mine;

  return (
    <div>
      <PageHeader
        title="Reservations"
        subtitle="Approve incoming requests as a seller, and track your own buying requests."
      />
      <div className="flex gap-1 border-b mb-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {list.length === 0 && (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No reservations here.
          </div>
        )}
        {list.map((r) => (
          <div
            key={r.reservation_id || r.id}
            className="ntpc-card p-4 flex items-center gap-4"
          >
            <img
              src={r.listing?.image || ""}
              className="h-20 w-20 rounded-lg object-cover"
              alt=""
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">
                {r.reservation_id || r.id} · {r.date}
              </div>
              <div className="font-semibold truncate">{r.listing?.title}</div>
              <div className="text-sm text-muted-foreground">
                {tab === TABS[0] ? (
                  <>
                    Buyer:{" "}
                    <span className="font-medium text-foreground">
                      {r.buyer}
                    </span>
                  </>
                ) : (
                  <>Seller: {r.listing.seller.name}</>
                )}{" "}
                · {r.listing.township}
              </div>
            </div>
            <div className="text-right space-y-2 shrink-0">
              <div className="font-bold text-primary">
                ₹{(r.listing?.price ?? 0).toLocaleString("en-IN")}
              </div>
              <StatusBadge status={r.status} />
              {tab === TABS[0] &&
                (r.status ?? "").toString().toUpperCase() === "PENDING" && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleApprove(r.reservation_id)}
                      className="ntpc-btn-primary !py-1 !px-2 text-xs"
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(r.reservation_id)}
                      className="ntpc-btn-secondary !py-1 !px-2 text-xs text-red-600"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
