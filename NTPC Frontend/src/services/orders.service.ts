import api from "../lib/api";

const pendingOrderRequests = new Set<string | number>();

export async function fetchOrders() {
  const res = await api.get("/orders");
  return res.data ?? [];
}

export async function createOrderFromReservation(reservationId: string | number) {
  if (pendingOrderRequests.has(reservationId)) {
    return null;
  }

  pendingOrderRequests.add(reservationId);

  try {
    const res = await api.post(`/orders/from-reservation/${reservationId}`);
    return res.data;
  } finally {
    pendingOrderRequests.delete(reservationId);
  }
}

export async function fetchOrderById(orderId: string | number) {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
}
