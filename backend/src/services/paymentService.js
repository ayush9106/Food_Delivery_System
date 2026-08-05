const crypto = require("crypto");
const { Payment } = require("../models");

/**
 * Payment service — an abstraction layer over payment gateways.
 *
 * The architecture is gateway-ready:
 *   - PaymentController always calls paymentService.* methods.
 *   - To add Stripe/Razorpay later, implement a gateway adapter and
 *     swap `gateway` in createPayment — no controller changes needed.
 */

const GATEWAYS = {
  internal: "internal", // demo / cash / mock
  stripe: "stripe",
  razorpay: "razorpay",
};

/**
 * createPaymentIntent — placeholder for a real gateway intent.
 * Currently returns a mock reference so the full flow can be demoed.
 */
const createPaymentIntent = async ({ amount, orderId, method }) => {
  const gateway = GATEWAYS.internal;
  const reference = `PAY-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
  return { gateway, reference, clientSecret: null };
};

/**
 * verifyPayment — placeholder. A real gateway webhook would call
 * this to confirm a payment. Here it simply marks payment success.
 */
const verifyPayment = async ({ orderId, transactionId, gateway = GATEWAYS.internal }) => {
  const payment = await Payment.findOne({ where: { orderId } });
  if (!payment) return { verified: false, reason: "payment_not_found" };

  payment.status = "success";
  payment.transactionId = transactionId || payment.transactionId;
  payment.paidAt = new Date();
  await payment.save();

  return { verified: true, payment };
};

module.exports = {
  GATEWAYS,
  createPaymentIntent,
  verifyPayment,
};
