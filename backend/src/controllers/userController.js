const { User, Role, Address, DeliveryPartner } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");
const { getUploadedUrl } = require("../middleware/upload");

/**
 * GET /api/users/profile — logged in user's full profile.
 */
exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    include: [
      { model: Role, as: "role", attributes: ["id", "name"] },
      { model: Address, as: "addresses" },
      { model: DeliveryPartner, as: "deliveryProfile" },
    ],
  });
  sendSuccess(res, user);
});

/**
 * PATCH /api/users/profile — update profile fields.
 */
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, phone } = req.body;
  const user = await User.findByPk(req.user.id);

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  await user.save();
  sendSuccess(res, user, "Profile updated");
});

/**
 * PATCH /api/users/profile-image — upload profile image.
 */
exports.uploadProfileImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("No image provided", 400));

  const user = await User.findByPk(req.user.id);
  user.profileImage = getUploadedUrl(req.file);
  await user.save();
  sendSuccess(res, { profileImage: user.profileImage }, "Profile image updated");
});

/**
 * Delivery partner profile update (vehicle, availability).
 */
exports.updateDeliveryProfile = catchAsync(async (req, res, next) => {
  const profile = await DeliveryPartner.findOne({ where: { userId: req.user.id } });
  if (!profile) return next(new AppError("Delivery profile not found", 404));

  const { vehicleType, vehicleNumber, availability } = req.body;
  if (vehicleType) profile.vehicleType = vehicleType;
  if (vehicleNumber !== undefined) profile.vehicleNumber = vehicleNumber;
  if (availability) profile.availability = availability;
  await profile.save();
  sendSuccess(res, profile, "Delivery profile updated");
});

/* ------------------------------------------------------------------ *
 *  Address management
 * ------------------------------------------------------------------ */

/**
 * GET /api/users/addresses
 */
exports.getAddresses = catchAsync(async (req, res, next) => {
  const addresses = await Address.findAll({
    where: { userId: req.user.id },
    order: [["isDefault", "DESC"], ["id", "DESC"]],
  });
  sendSuccess(res, addresses);
});

/**
 * POST /api/users/addresses
 */
exports.addAddress = catchAsync(async (req, res, next) => {
  const { label, fullAddress, landmark, city, state, pincode, isDefault } = req.body;

  if (isDefault) {
    await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
  }

  const address = await Address.create({
    userId: req.user.id,
    label: label || "Home",
    fullAddress,
    landmark,
    city,
    state,
    pincode,
    isDefault: isDefault || false,
  });
  sendSuccess(res, address, "Address added", 201);
});

/**
 * PUT /api/users/addresses/:id
 */
exports.updateAddress = catchAsync(async (req, res, next) => {
  const address = await Address.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!address) return next(new AppError("Address not found", 404));

  const { label, fullAddress, landmark, city, state, pincode, isDefault } = req.body;

  if (isDefault) {
    await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
  }

  Object.assign(address, {
    label: label || address.label,
    fullAddress: fullAddress || address.fullAddress,
    landmark: landmark !== undefined ? landmark : address.landmark,
    city: city || address.city,
    state: state !== undefined ? state : address.state,
    pincode: pincode || address.pincode,
    isDefault: isDefault !== undefined ? isDefault : address.isDefault,
  });
  await address.save();
  sendSuccess(res, address, "Address updated");
});

/**
 * DELETE /api/users/addresses/:id
 */
exports.deleteAddress = catchAsync(async (req, res, next) => {
  const deleted = await Address.destroy({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!deleted) return next(new AppError("Address not found", 404));
  sendSuccess(res, null, "Address deleted");
});
