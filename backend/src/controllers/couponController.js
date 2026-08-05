const { Coupon } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");

/**
 * POST /api/coupons/validate — validate a coupon for a cart total.
 */
exports.validateCoupon = catchAsync(async (req, res, next) => {
  const { code, itemsTotal } = req.body;
  const coupon = await Coupon.findOne({ where: { code: String(code || "").trim().toUpperCase(), isActive: true } });

  if (!coupon) return next(new AppError("Invalid coupon code", 400));

  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validTo) {
    return next(new AppError("This coupon has expired", 400));
  }
  if (Number(itemsTotal || 0) < Number(coupon.minOrderAmount || 0)) {
    return next(new AppError(`Add ₹${coupon.minOrderAmount} more to use this coupon`, 400));
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return next(new AppError("This coupon has reached its usage limit", 400));
  }

  const discount =
    coupon.type === "percent"
      ? (Number(itemsTotal) * Number(coupon.value)) / 100
      : Number(coupon.value);
  const finalDiscount = coupon.maxDiscount
    ? Math.min(discount, Number(coupon.maxDiscount))
    : discount;

  sendSuccess(res, {
    coupon: coupon.toJSON(),
    discount: Number(finalDiscount.toFixed(2)),
  });
});

/* ------------------------------------------------------------------ *
 *  Admin CRUD
 * ------------------------------------------------------------------ */

exports.listCoupons = catchAsync(async (req, res, next) => {
  const coupons = await Coupon.findAll({ order: [["id", "DESC"]] });
  sendSuccess(res, coupons);
});

exports.createCoupon = catchAsync(async (req, res, next) => {
  const { code, description, type, value, minOrderAmount, maxDiscount, validFrom, validTo, usageLimit, isActive } = req.body;
  const coupon = await Coupon.create({
    code, description, type, value, minOrderAmount, maxDiscount,
    validFrom, validTo, usageLimit, isActive: isActive === undefined ? true : isActive === "true",
  });
  sendSuccess(res, coupon, "Coupon created", 201);
});

exports.updateCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) return next(new AppError("Coupon not found", 404));

  const fields = ["code", "description", "type", "value", "minOrderAmount", "maxDiscount", "validFrom", "validTo", "usageLimit", "isActive"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      coupon[f] = f === "isActive" ? req.body[f] === "true" || req.body[f] === true : req.body[f];
    }
  });
  await coupon.save();
  sendSuccess(res, coupon, "Coupon updated");
});

exports.deleteCoupon = catchAsync(async (req, res, next) => {
  const deleted = await Coupon.destroy({ where: { id: req.params.id } });
  if (!deleted) return next(new AppError("Coupon not found", 404));
  sendSuccess(res, null, "Coupon deleted");
});
