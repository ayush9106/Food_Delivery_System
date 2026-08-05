const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

/**
 * validate — runs the express-validator chain and returns the
 * first field error with a 422 status code.
 */
const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const first = errors.array()[0];
    return next(
      new AppError(
        first.msg || "Validation failed",
        422,
        errors.array().reduce((acc, e) => {
          acc[e.path] = e.msg;
          return acc;
        }, {})
      )
    );
  };
};

module.exports = validate;
