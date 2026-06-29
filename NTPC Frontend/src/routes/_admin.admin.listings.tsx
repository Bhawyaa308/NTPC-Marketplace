import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, SearchBar, StatusBadge } from "../components/common";
import {
  deleteAdminListing,
  fetchAdminListings,
  updateAdminListingStatus,
  type Listing,
} from "../services/listing.service";

export const Route = createFileRoute("/_admin/admin/listings")({ component: AdminListings });

function getName(value: Listing["category"] | Listing["township"] | Listing["seller"]) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name || "";
}

function getId(listing: Listing) {
  return listing.listing_id ?? listing.id;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatPrice(value?: number | string) {
  const amount = Number(value || 0);
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

function AdminListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [township, setTownship] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);
  const [error, setError] = useState("");

  async function loadListings() {
    try {
      setLoading(true);
      setError("");
      setListings(await fetchAdminListings());
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to load listings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadListings();
  }, []);

  const statuses = useMemo(
    () => Array.from(new Set(listings.map((item) => item.status).filter(Boolean))).sort() as string[],
    [listings],
  );
  const categories = useMemo(
    () => Array.from(new Set(listings.map((item) => getName(item.category)).filter(Boolean))).sort(),
    [listings],
  );
  const townships = useMemo(
    () => Array.from(new Set(listings.map((item) => getName(item.township)).filter(Boolean))).sort(),
    [listings],
  );

  const filtered = listings.filter((listing) => {
    const categoryName = getName(listing.category);
    const townshipName = getName(listing.township);
    const sellerName = getName(listing.seller);
    const haystack = [listing.title, categoryName, townshipName, sellerName, listing.status]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return (
      haystack.includes(q.toLowerCase()) &&
      (status === "ALL" || listing.status === status) &&
      (category === "ALL" || categoryName === category) &&
      (township === "ALL" || townshipName === township)
    );
  });

  async function changeStatus(listing: Listing, nextStatus: "ACTIVE" | "EXPIRED") {
    const id = getId(listing);
    if (!id || updatingId) return;
    try {
      setUpdatingId(id);
      setError("");
      const updated = await updateAdminListingStatus(id, nextStatus);
      setListings((current) =>
        current.map((item) => (String(getId(item)) === String(getId(updated)) ? { ...item, ...updated } : item)),
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Unable to update listing.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteListing(listing: Listing) {
    const id = getId(listing);
    if (!id || updatingId) return;
    try {
      setUpdatingId(id);
      setError("");
      const updated = await deleteAdminListing(id);
      setListings((current) =>
        current.map((item) => (String(getId(item)) === String(getId(updated)) ? { ...item, ...updated } : item)),
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Unable to delete listing.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="All Listings"
        subtitle="Moderate active listings on the platform."
        action={<div className="w-72"><SearchBar value={q} onChange={setQ} placeholder="Search listings" /></div>}
      />
      <div className="ntpc-card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <select className="ntpc-input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="ntpc-input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="ALL">All Categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="ntpc-input" value={township} onChange={(e) => setTownship(e.target.value)}>
            <option value="ALL">All Townships</option>
            {townships.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>
      {error ? <div className="ntpc-card p-4 text-sm text-red-600 mb-4">{error}</div> : null}
      <div className="ntpc-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3 hidden md:table-cell">Seller</th>
              <th className="px-4 py-3 hidden md:table-cell">Township</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 hidden lg:table-cell">Created</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-6 text-muted-foreground">Loading listings...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-muted-foreground">No listings found.</td></tr>
            ) : (
              filtered.map((listing) => {
                const id = getId(listing);
                const image = listing.image_urls?.[0] || "";
                const isActive = String(listing.status).toUpperCase() === "ACTIVE";
                const isExpired = String(listing.status).toUpperCase() === "EXPIRED";
                return (
                  <tr key={id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-muted overflow-hidden shrink-0">
                          {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : null}
                        </div>
                        <div>
                          <div className="font-semibold">{listing.title || "-"}</div>
                          <div className="text-xs text-muted-foreground">{getName(listing.category) || "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">{getName(listing.seller) || "-"}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{getName(listing.township) || "-"}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(listing.price)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">{formatDate(listing.created_at)}</td>
                    <td className="px-4 py-3"><StatusBadge status={listing.status || "-"} /></td>
                    <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                      <button onClick={() => navigate({ to: "/listing/$id", params: { id: String(id) } })} className="ntpc-btn-secondary !py-1 !px-2 text-xs">View</button>
                      {!isActive ? <button onClick={() => void changeStatus(listing, "ACTIVE")} disabled={updatingId === id} className="ntpc-btn-secondary !py-1 !px-2 text-xs">Approve</button> : null}
                      {isExpired ? <button onClick={() => void changeStatus(listing, "ACTIVE")} disabled={updatingId === id} className="ntpc-btn-secondary !py-1 !px-2 text-xs">Activate</button> : null}
                      {isActive ? <button onClick={() => void changeStatus(listing, "EXPIRED")} disabled={updatingId === id} className="ntpc-btn-secondary !py-1 !px-2 text-xs">Suspend</button> : null}
                      <button onClick={() => void deleteListing(listing)} disabled={updatingId === id} className="ntpc-btn-secondary !py-1 !px-2 text-xs text-red-600 hover:bg-red-50">Delete</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
