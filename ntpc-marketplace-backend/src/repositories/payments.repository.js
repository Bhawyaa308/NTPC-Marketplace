const { pool } = require('../config/db');

async function createPayment({ order_id, payment_gateway, paytm_transaction_id, amount, payment_method, status, gateway_response }) {
  const gatewayResponse =
    typeof gateway_response === "object"
      ? JSON.stringify(gateway_response)
      : gateway_response
        ? JSON.stringify({ message: gateway_response })
        : null;

  const { rows } = await pool.query(
    `INSERT INTO payments (
      order_id,
      payment_gateway,
      paytm_transaction_id,
      amount,
      payment_method,
      status,
      gateway_response,
      payment_date,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    RETURNING payment_id, order_id, payment_gateway, paytm_transaction_id, amount, payment_method, status, gateway_response, webhook_received_at, payment_date, created_at`,
    [order_id, payment_gateway, paytm_transaction_id, amount, payment_method, status, gatewayResponse]
  );
  return rows[0];
}

async function findPaymentByOrderId(order_id) {
  const { rows } = await pool.query(
    `SELECT payment_id, order_id, payment_gateway, paytm_transaction_id, amount, payment_method, status, gateway_response, webhook_received_at, payment_date, created_at
     FROM payments
     WHERE order_id = $1
     LIMIT 1`,
    [order_id]
  );
  return rows[0];
}

async function findPaymentById(payment_id) {
  const { rows } = await pool.query(
    `SELECT payment_id, order_id, payment_gateway, paytm_transaction_id, amount, payment_method, status, gateway_response, webhook_received_at, payment_date, created_at
     FROM payments
     WHERE payment_id = $1
     LIMIT 1`,
    [payment_id]
  );
  return rows[0];
}

module.exports = {
  createPayment,
  findPaymentByOrderId,
  findPaymentById,
};
