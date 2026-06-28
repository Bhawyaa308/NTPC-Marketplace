import {
  fetchWishlist,
  addWishlistItem,
  removeWishlistItem,
} from "../services/wishlist.service";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ListingCard } from "../components/ListingCard";
import * as Icons from "lucide-react";
import { fetchMarketplaceData } from "../services/listing.service";
export const Route = createFileRoute("/_employee/marketplace")({
  component: Marketplace,
});

function Marketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [wishlist, setWishlist] = useState<number[]>([]);
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [{ listings, categories }, wishlistItems] = await Promise.all([
        fetchMarketplaceData(),
        fetchWishlist(),
      ]);

      const activeListings = (listings || []).filter(
        (listing: any) =>
          String(listing.status || "").toUpperCase() === "ACTIVE",
      );

      setListings(activeListings);
      setCategories(categories);

      setWishlist(wishlistItems.map((x: any) => x.listing_id));
    } catch (err) {
      console.error("Marketplace fetch error:", err);
    } finally {
      setLoading(false);
    }
  }
  async function toggleWishlist(id: number) {
    try {
      if (wishlist.includes(id)) {
        await removeWishlistItem(id);

        setWishlist((prev) => prev.filter((x) => x !== id));
      } else {
        await addWishlistItem(id);

        setWishlist((prev) => [...prev, id]);
      }
    } catch (err) {
      console.error(err);
    }
  }
  const filtered =
    cat === "all"
      ? listings
      : listings.filter((l) => String(l.category_id) === String(cat));

  const categoryIcons: Record<string, any> = {
    Electronics: Icons.Tv,
    Furniture: Icons.Sofa,
    Vehicles: Icons.Car,
    Books: Icons.BookOpen,
    Appliances: Icons.WashingMachine,
    Others: Icons.Package,
  };

  if (loading) {
    return <div className="p-10 text-center">Loading Marketplace...</div>;
  }

  return (
    <div className="space-y-10">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#0a5cad] text-white p-6 sm:p-10">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest opacity-80">
            NTPC Internal Marketplace
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mt-2">
            Buy & sell within the NTPC family
          </h1>

          <p className="opacity-90 mt-2 text-sm sm:text-base">
            Trusted listings from verified employees across every township.
          </p>

          <Link
            to="/transfers"
            className="inline-flex items-center gap-2 mt-5 bg-accent hover:bg-orange-600 text-white font-semibold text-sm rounded-lg px-4 py-2.5"
          >
            <Icons.Truck size={16} />
            Explore Transfer Marketplace
          </Link>
        </div>
      </section>

      {/* CATEGORIES */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Categories</h2>

          <button
            onClick={() => setCat("all")}
            className="text-sm font-semibold text-primary hover:underline"
          >
            All Categories
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c: any) => {
            const Icon = categoryIcons[c.name] || Icons.Package;

            return (
              <button
                key={c.category_id}
                onClick={() =>
                  setCat(
                    cat === String(c.category_id)
                      ? "all"
                      : String(c.category_id),
                  )
                }
                className={`ntpc-card p-4 flex flex-col items-center gap-2 transition hover:shadow-soft ${
                  cat === String(c.category_id) ? "ring-2 ring-primary" : ""
                }`}
              >
                <div
                  className={`h-11 w-11 rounded-full flex items-center justify-center ${
                    cat === String(c.category_id)
                      ? "bg-primary text-white"
                      : "bg-primary-soft text-primary"
                  }`}
                >
                  <Icon size={20} />
                </div>

                <div className="text-sm font-semibold">{c.name}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* LISTINGS */}
      <section>
        <h2 className="text-lg font-bold mb-4">Listings</h2>

        {filtered.length === 0 ? (
          <div className="ntpc-card p-8 text-center text-muted-foreground">
            No listings found.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((listing) => (
              <ListingCard
                key={listing.listing_id}
                listing={listing}
                wishlisted={wishlist.includes(listing.listing_id)}
                onWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
