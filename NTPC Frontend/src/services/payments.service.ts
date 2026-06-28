import api from "../lib/api";

export async function createPaymentForOrder(orderId: string | number) {
  const res = await api.post(`/payments/create-order/${orderId}`);
  return res.data;
}

export async function simulatePaymentSuccess(orderId: string | number) {
  const res = await api.post(`/payments/simulate-success/${orderId}`, {
    payment_method: "SIMULATED",
    payment_gateway: "SIMULATED",
    gateway_response: {
      success: true,
      simulated: true
    }
  });
  return res.data;
}

export async function fetchPayment(paymentId: string | number) {
  const res = await api.get(`/payments/${paymentId}`);
  return res.data;
}
