const { Payment, Order } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");
const paymentService = require("../services/paymentService");

/**
 * POST /api/payments/initiate — create a payment intent for an order.
 * Gateway-ready: swap GATEWAYS.internal for a real Stripe/Razorpay adapter.
 */
exports.initiatePayment = catchAsync(async (req, res, next) => {
  const { orderId, method = "card" } = req.body;
  if (!["card", "upi", "wallet"].includes(method)) {
    return next(new AppError("Invalid payment method for online payment", 400));
  }

  const order = await Order.findOne({ where: { id: orderId, userId: req.user.id } });
  if (!order) return next(new AppError("Order not found", 404));
  if (order.paymentStatus === "paid") {
    return next(new AppError("Order is already paid", 400));
  }

  const intent = await paymentService.createPaymentIntent({
    amount: Number(order.totalAmount),
    orderId: order.id,
    method,
  });

  // Persist/update the payment record with the gateway reference.
  const [payment] = await Payment.findOrCreate({
    where: { orderId: order.id },
    defaults: {
      userId: req.user.id,
      amount: order.totalAmount,
      method,
      status: "pending",
      gateway: intent.gateway,
      transactionId: intent.reference,
    },
  });

  if (payment.gateway !== intent.gateway) {
    payment.gateway = intent.gateway;
    payment.transactionId = intent.reference || payment.transactionId;
    await payment.save();
  }

  sendSuccess(res, { paymentId: payment.id, ...intent }, "Payment initiated");
});

/**
 * POST /api/payments/confirm — simulate gateway confirmation.
 */
exports.confirmPayment = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;

  const order = await Order.findOne({ where: { id: orderId, userId: req.user.id } });
  if (!order) return next(new AppError("Order not found", 404));

  const result = await paymentService.verifyPayment({
    orderId,
    transactionId: `TX-${Date.now()}`,
  });
  if (!result.verified) return next(new AppError(result.reason || "Payment failed", 400));

  order.paymentStatus = "paid";
  await order.save();

  sendSuccess(res, { orderId: order.id, paidAt: result.payment.paidAt }, "Payment successful");
});

/**
 * GET /api/payments/history — payment history for the user.
 */
exports.paymentHistory = catchAsync(async (req, res, next) => {
  const payments = await Payment.findAll({
    where: { userId: req.user.id },
    include: [{ model: Order, as: "order", attributes: ["id", "orderNumber"] }],
    order: [["id", "DESC"]],
  });
  sendSuccess(res, payments);
});
