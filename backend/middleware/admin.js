const ApiError = require('../utils/ApiError');

// Must run AFTER requireAuth. Blocks any non-admin from admin routes.
function requireAdmin(req, res, next) {
  if (!req.user) return next(ApiError.unauthorized());
  if (req.user.role !== 'admin') {
    return next(ApiError.forbidden('Admin access required.'));
  }
  next();
}

module.exports = requireAdmin;
