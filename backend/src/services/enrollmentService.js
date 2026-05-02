import { EnrollmentRequest } from "../models/EnrollmentRequest.js";
import { Enrollment } from "../models/Enrollment.js";
import { Course } from "../models/Course.js";
import { AppError } from "../utils/appError.js";

export async function requestEnrollment(learnerId, courseId, note = "") {
  const course = await Course.findById(courseId);
  if (!course) throw new AppError("Course not found", 404);

  const existingEnrollment = await Enrollment.findOne({ learnerId, courseId });
  if (existingEnrollment) throw new AppError("Already enrolled", 409);

  const existingRequest = await EnrollmentRequest.findOne({ learnerId, courseId });
  if (existingRequest && existingRequest.status === "pending") {
    throw new AppError("Enrollment request already pending", 409);
  }

  if (existingRequest) {
    existingRequest.status = "pending";
    existingRequest.note = note;
    existingRequest.reviewedBy = undefined;
    existingRequest.reviewedAt = undefined;
    await existingRequest.save();
    return existingRequest;
  }

  return EnrollmentRequest.create({ learnerId, courseId, note });
}

export async function listEnrollmentRequests(user) {
  const filter = {};
  if (user.role === "faculty") {
    const taughtCourseIds = await Course.find({ facultyIds: user._id }).distinct("_id");
    filter.courseId = { $in: taughtCourseIds };
  }
  return EnrollmentRequest.find(filter)
    .populate("learnerId", "name email role")
    .populate("courseId", "title level")
    .sort({ createdAt: -1 });
}

export async function reviewEnrollmentRequest(requestId, user, status) {
  const reqDoc = await EnrollmentRequest.findById(requestId).populate("courseId");
  if (!reqDoc) throw new AppError("Enrollment request not found", 404);

  const isFacultyForCourse = reqDoc.courseId?.facultyIds?.some(
    (id) => String(id) === String(user._id)
  );
  const canReview = user.role === "admin" || (user.role === "faculty" && isFacultyForCourse);
  if (!canReview) throw new AppError("Forbidden", 403);

  reqDoc.status = status;
  reqDoc.reviewedBy = user._id;
  reqDoc.reviewedAt = new Date();
  await reqDoc.save();

  if (status === "approved") {
    await Enrollment.updateOne(
      { learnerId: reqDoc.learnerId, courseId: reqDoc.courseId._id },
      { $setOnInsert: { learnerId: reqDoc.learnerId, courseId: reqDoc.courseId._id } },
      { upsert: true }
    );
  }
  return reqDoc;
}

export async function listMyEnrollments(learnerId) {
  return listEnrollmentsForLearner(learnerId);
}

export async function listEnrollmentsForLearner(learnerId) {
  return Enrollment.find({ learnerId })
    .populate("courseId", "title level durationHours isPublished")
    .sort({ createdAt: -1 });
}

/** Pending / rejected access requests (approved rows may exist but enrollments cover active access). */
export async function listEnrollmentRequestsForLearner(learnerId) {
  return EnrollmentRequest.find({ learnerId })
    .populate("courseId", "title level durationHours isPublished")
    .sort({ updatedAt: -1 });
}
