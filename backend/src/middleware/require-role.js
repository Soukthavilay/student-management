import { forbidden } from "../utils/http-error.js";

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(forbidden("You do not have permission to access this resource"));
    }

    return next();
  };
}
