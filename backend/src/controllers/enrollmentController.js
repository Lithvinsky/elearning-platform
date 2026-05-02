import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/appError.js";
import {
  listEnrollmentRequests,
  listEnrollmentRequestsForLearner,
  listEnrollmentsForLearner,
  listMyEnrollments,
  requestEnrollment,
  reviewEnrollmentRequest,
} from "../services/enrollmentService.js";

export const requestAccess = asyncHandler(async (req, res) => {
  const record = await requestEnrollment(req.user._id, req.body.courseId, req.body.note);
  return sendSuccess(res, record, "Enrollment request submitted", 201);
});

export const getRequests = asyncHandler(async (req, res) => {
  const rows = await listEnrollmentRequests(req.user);
  return sendSuccess(res, rows, "Enrollment requests fetched");
});

export const reviewRequest = asyncHandler(async (req, res) => {
  const record = await reviewEnrollmentRequest(req.params.id, req.user, req.body.status);
  return sendSuccess(res, record, "Enrollment request updated");
});

export const myEnrollments = asyncHandler(async (req, res) => {
  const rows = await listMyEnrollments(req.user._id);
  return sendSuccess(res, rows, "Enrollments fetched");
});

export const enrollmentsForUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const isAdmin = req.user.role === "admin";
  const isSelf = String(req.user._id) === String(userId);
  if (!isAdmin && !isSelf) {
    throw new AppError("Forbidden", 403);
  }
  const exists = await User.exists({ _id: userId });
  if (!exists) throw new AppError("User not found", 404);
  const rows = await listEnrollmentsForLearner(userId);
  return sendSuccess(res, rows, "Enrollments fetched");
});

export const enrollmentRequestsForUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const isAdmin = req.user.role === "admin";
  const isSelf = String(req.user._id) === String(userId);
  if (!isAdmin && !isSelf) {
    throw new AppError("Forbidden", 403);
  }
  const exists = await User.exists({ _id: userId });
  if (!exists) throw new AppError("User not found", 404);
  const rows = await listEnrollmentRequestsForLearner(userId);
  return sendSuccess(res, rows, "Enrollment requests fetched");
});
