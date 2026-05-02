import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { verifyAccessToken } from "../utils/tokens.js";

function extractBearer(header = "") {
  if (!header.startsWith("Bearer ")) return "";
  return header.slice(7).trim();
}

export async function requireAuth(req, _res, next) {
  try {
    const token = extractBearer(req.headers.authorization);
    if (!token) throw new AppError("Unauthorized", 401);
    const payload = verifyAccessToken(token);
    if (payload.type !== "access") throw new AppError("Unauthorized", 401);
    const user = await User.findById(payload.sub);
    if (!user) throw new AppError("Unauthorized", 401);
    req.user = user;
    next();
  } catch {
    next(new AppError("Unauthorized", 401));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError("Unauthorized", 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }
    next();
  };
}
