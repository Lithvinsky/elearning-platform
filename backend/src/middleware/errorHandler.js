import { validationResult } from "express-validator";
import { AppError } from "../utils/appError.js";
import { sendError } from "../utils/response.js";

export function validateRequest(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new AppError("Validation failed", 422, result.array()));
  }
  next();
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.details);
  }

  if (err?.name === "CastError") {
    return sendError(res, "Invalid id", 400);
  }
  if (err?.code === 11000) {
    return sendError(res, "Resource already exists", 409);
  }

  console.error(err);
  return sendError(res, "Internal server error", 500);
}
