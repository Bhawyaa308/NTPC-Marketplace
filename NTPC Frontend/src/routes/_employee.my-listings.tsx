import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, StatusBadge } from "../components/common";
import { Package, Plus } from "lucide-react";
import api from "../lib/api";
import { getAuth } from "../lib/auth";

export const Route = createFileRoute("/_employee/my-listings")({
  component: MyListings,
});

const TABS = ["Active", "Reserved", "Sold", "Expired"] as const;

const STATUS_MAP: Record<(typeof TABS)[number], string> = {
  Active: "ACTIVE",
  Reserved: "RESERVED",
  Sold: "SOLD",
  Expired: "EXPIRED",
};

function MyListings() {
  const [items, setItems] = useState<any[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Active");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadMyListings();
  }, []);

  async function loadMyListings() {
    setLoading(true);
    try {
      const res = await api.get("/listings");
      const all: any[] = Array.isArray(res?.data?.data) ? res.data.data : [];
      const auth = getAuth();
      const myId = auth?.user?.user_id;
      const myListings = all.filter(
        (l: any) =>
          String(l.seller?.user_id ?? l.seller_id ?? l.seller) === String(myId),
      );
      setItems(myListings);
    } catch (err) {
      console.error("Failed to load listings", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const handleMarkSold = async (listing: any) => {
    try {
      await api.put(`/listings/${listing.listing_id}`, { status: "SOLD" });
      await loadMyListings();
    } catch (err) {
      console.error("Failed to mark sold", err);
    }
  };

  const list = items.filter((l) => l.status === STATUS_MAP[tab]);

  return (
    <div>
      <PageHeader
        title="My Listings"
        subtitle="Manage items you're selling on the marketplace."
        action={
          <Link to="/create-listing" className="ntpc-btn-primary">
            <Plus size={16} />
            Create Listing
          </Link>
        }
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
              ({items.filter((l) => l.status === STATUS_MAP[t]).length})
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading && <div className="p-8">Loading...</div>}
        {!loading && list.length === 0 && (
          <div className="text-sm text-muted-foreground py-12 text-center flex flex-col items-center gap-2">
            <Package size={28} /> No {tab.toLowerCase()} listings.
          </div>
        )}
        {list.map((l) => (
          <div
            key={l.listing_id}
            className="ntpc-card p-4 flex items-center gap-4"
          >
            {l.image_urls?.[0] ? (
              <img
                src={l.image_urls[0]}
                className="h-20 w-20 rounded-lg object-cover"
                alt=""
              />
            ) : (
              <div className="h-20 w-20 rounded-lg bg-muted" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">
                {l.listing_id} ·{" "}
                {l.township?.name ?? l.township ?? l.township_id}
              </div>
              <div className="font-semibold truncate">{l.title}</div>
              <div className="text-sm text-muted-foreground">
                Condition: {l.condition}
              </div>
            </div>
            <div className="text-right space-y-2 shrink-0">
              <div className="font-bold text-primary">
                ₹{l.price.toLocaleString("en-IN")}
              </div>
              <StatusBadge status={l.status} />
              <div className="flex gap-2 mt-2 justify-end">
                <Link
                  to="/listing/$id"
                  params={{ id: String(l.listing_id) }}
                  className="ntpc-btn-secondary !py-1 !px-2 text-xs"
                >
                  View
                </Link>
                {l.status === STATUS_MAP["Active"] && (
                  <button
                    onClick={() => handleMarkSold(l)}
                    className="ntpc-btn-secondary !py-1 !px-2 text-xs"
                  >
                    Mark Sold
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
