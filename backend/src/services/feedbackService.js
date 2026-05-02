import mongoose from "mongoose";
import { Feedback } from "../models/Feedback.js";
import { Enrollment } from "../models/Enrollment.js";
import { Course } from "../models/Course.js";
import { AppError } from "../utils/appError.js";

export async function getFeedbackSummary(courseId) {
  const cid =
    typeof courseId === "string" ? new mongoose.Types.ObjectId(courseId) : courseId;
  const agg = await Feedback.aggregate([
    { $match: { courseId: cid } },
    {
      $group: {
        _id: null,
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  if (!agg.length) {
    return { averageRating: null, count: 0 };
  }
  const rounded = Math.round(agg[0].avg * 10) / 10;
  return { averageRating: rounded, count: agg[0].count };
}

export async function getMyFeedbackForCourse(learnerId, courseId) {
  const row = await Feedback.findOne({ learnerId, courseId }).lean();
  if (!row) return null;
  return {
    _id: row._id,
    rating: row.rating,
    comment: row.comment || "",
  };
}

export async function upsertFeedback(learnerId, courseId, rating, comment) {
  const course = await Course.findById(courseId);
  if (!course) throw new AppError("Course not found", 404);

  const enrollment = await Enrollment.findOne({ learnerId, courseId });
  if (!enrollment) {
    throw new AppError("Only enrolled learners can submit feedback", 403);
  }

  return Feedback.findOneAndUpdate(
    { learnerId, courseId },
    { rating, comment },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}
