import { Link } from "@tanstack/react-router";
import { Heart, MapPin } from "lucide-react";

export function ListingCard({
  listing,
  onWishlist,
  wishlisted,
}: {
  listing: any;
  onWishlist?: (id: number) => void;
  wishlisted?: boolean;
}) {
  const image =
    listing.image_urls?.[0] ||
    "https://via.placeholder.com/400x300?text=NTPC+Marketplace";

  return (
    <div className="ntpc-card overflow-hidden group flex flex-col">
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img
          src={image}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover group-hover:scale-[1.03] transition"
        />

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            onWishlist?.(listing.listing_id);
          }}
          className={`absolute top-2 right-2 h-8 w-8 inline-flex items-center justify-center rounded-full bg-white/90 border border-border hover:bg-white ${
            wishlisted ? "text-red-500" : "text-slate-600"
          }`}
          aria-label="wishlist"
        >
          <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {listing.category?.name || listing.category_id || "Category"}
        </div>

        <div className="font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
          {listing.title}
        </div>

        <div className="text-primary font-bold text-base">
          ₹{Number(listing.price).toLocaleString("en-IN")}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin size={12} />
          {listing.township?.name || listing.township_id || "Township"}
        </div>

        <div className="mt-2 pt-2 border-t flex items-center justify-end">
          <Link
            to="/listing/$id"
            params={{ id: String(listing.listing_id) }}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}
