import api from "../lib/api";

export type Listing = {
  listing_id: number;
  id?: number;
  title?: string;
  description?: string;
  price?: number | string;
  status?: string;
  created_at?: string;
  image_urls?: string[];
  category?: { category_id?: number; name?: string } | string;
  township?: { township_id?: number; name?: string } | string;
  seller?: { user_id?: number; name?: string } | string;
};

export async function fetchMarketplaceData(page = 1, limit = 24) {
  const [listingRes, categoryRes] = await Promise.all([
    api.get("/listings", { params: { page, limit } }),
    api.get("/categories"),
  ]);

  return {
    listings: listingRes.data?.data ?? listingRes.data ?? [],
    total: listingRes.data?.total ?? 0,
    categories: categoryRes.data ?? [],
  };
}

export async function fetchCategories() {
  const res = await api.get("/categories");
  return res.data ?? [];
}

export async function fetchAdminListings() {
  const res = await api.get("/listings", { params: { page: 1, limit: 500 } });
  return (res.data?.data ?? res.data ?? []) as Listing[];
}

export async function updateAdminListingStatus(listingId: number | string, status: "ACTIVE" | "EXPIRED") {
  const res = await api.patch(`/listings/admin/${listingId}/status`, { status });
  return res.data as Listing;
}

export async function deleteAdminListing(listingId: number | string) {
  const res = await api.delete(`/listings/admin/${listingId}`);
  return res.data as Listing;
}
