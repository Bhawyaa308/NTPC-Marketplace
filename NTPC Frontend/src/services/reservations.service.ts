import api from "../lib/api";

export async function fetchReservations() {
  const res = await api.get("/reservations");
  return res.data ?? [];
}

export async function approveReservation(reservationId: string | number) {
  const res = await api.put(`/reservations/${reservationId}/approve`);
  return res.data;
}

export async function rejectReservation(reservationId: string | number) {
  const res = await api.put(`/reservations/${reservationId}/reject`);
  return res.data;
}
export async function createReservation(listing_id: number) {
  const res = await api.post("/reservations", {
    listing_id,
  });

  return res.data;
}