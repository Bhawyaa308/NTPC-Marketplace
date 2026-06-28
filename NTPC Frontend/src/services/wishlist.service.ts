import api from "../lib/api";

export async function fetchWishlist() {
  const res = await api.get("/wishlist");
  return res.data ?? [];
}

export async function addWishlistItem(listing_id: string | number) {
  const res = await api.post(`/wishlist/${listing_id}`);
  return res.data;
}

export async function removeWishlistItem(listing_id: string | number) {
  await api.delete(`/wishlist/${listing_id}`);
}
