import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ListingCard } from "../components/ListingCard";
import { PageHeader, EmptyState } from "../components/common";
import { Heart } from "lucide-react";
import {
  fetchWishlist,
  removeWishlistItem,
} from "../services/wishlist.service";

export const Route = createFileRoute("/_employee/wishlist")({
  component: Wishlist,
});

function Wishlist() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    try {
      setLoading(true);
      const data = await fetchWishlist();
      setList(data);
    } catch (err) {
      console.error("Wishlist fetch error:", err);
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(listingId: string | number) {
    try {
      await removeWishlistItem(listingId);
      await loadWishlist();
    } catch (err) {
      console.error("Remove wishlist item error:", err);
    }
  }

  return (
    <div>
      <PageHeader
        title="Wishlist"
        subtitle="Items you've saved across townships."
      />
      {list.length === 0 ? (
        <EmptyState
          title="No saved items"
          body="Tap the heart on any listing to save it here."
          icon={Heart}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((l) => (
            <ListingCard
              key={l.listing_id ?? l.id}
              listing={l}
              wishlisted
              onWishlist={(id) => handleRemove(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
