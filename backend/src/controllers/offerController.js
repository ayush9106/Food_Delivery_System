const { Offer } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");
const { getUploadedUrl } = require("../middleware/upload");

/**
 * GET /api/offers — active offers for customers.
 */
exports.listActiveOffers = catchAsync(async (req, res, next) => {
  const now = new Date();
  const offers = await Offer.findAll({
    where: {
      isActive: true,
      validFrom: { [require("sequelize").Op.lte]: now },
      validTo: { [require("sequelize").Op.gte]: now },
    },
    order: [["discountPercent", "DESC"]],
  });
  sendSuccess(res, offers);
});

/* ------------------------------------------------------------------ *
 *  Admin CRUD
 * ------------------------------------------------------------------ */

exports.listAllOffers = catchAsync(async (req, res, next) => {
  const offers = await Offer.findAll({ order: [["id", "DESC"]] });
  sendSuccess(res, offers);
});

exports.createOffer = catchAsync(async (req, res, next) => {
  const { title, description, discountPercent, minOrderAmount, maxDiscount, code, validFrom, validTo, isActive } = req.body;
  const offer = await Offer.create({
    title,
    description,
    discountPercent,
    minOrderAmount,
    maxDiscount,
    code,
    validFrom,
    validTo,
    isActive: isActive === undefined ? true : isActive === "true",
    image: getUploadedUrl(req.file),
  });
  sendSuccess(res, offer, "Offer created", 201);
});

exports.updateOffer = catchAsync(async (req, res, next) => {
  const offer = await Offer.findByPk(req.params.id);
  if (!offer) return next(new AppError("Offer not found", 404));

  const fields = ["title", "description", "discountPercent", "minOrderAmount", "maxDiscount", "code", "validFrom", "validTo", "isActive"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      offer[f] = f === "isActive" ? req.body[f] === "true" || req.body[f] === true : req.body[f];
    }
  });

  const image = getUploadedUrl(req.file);
  if (image) offer.image = image;

  await offer.save();
  sendSuccess(res, offer, "Offer updated");
});

exports.deleteOffer = catchAsync(async (req, res, next) => {
  const deleted = await Offer.destroy({ where: { id: req.params.id } });
  if (!deleted) return next(new AppError("Offer not found", 404));
  sendSuccess(res, null, "Offer deleted");
});
