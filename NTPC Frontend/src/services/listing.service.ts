import api from "../lib/api";

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
