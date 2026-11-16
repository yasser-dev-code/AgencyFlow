import { ApiError } from '../utils/http.js';

// Role authorization middleware factory. Usage: authorize('ADMIN')
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    return next();
  };
