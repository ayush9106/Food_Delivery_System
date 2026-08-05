/**
 * catchAsync — wraps async controllers and forwards rejected
 * promises to the Express error handler. Removes try/catch noise.
 */
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
