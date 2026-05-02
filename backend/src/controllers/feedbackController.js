import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  getFeedbackSummary,
  getMyFeedbackForCourse,
  upsertFeedback,
} from "../services/feedbackService.js";
import { Enrollment } from "../models/Enrollment.js";

export const getByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const summary = await getFeedbackSummary(courseId);

  if (req.user.role !== "learner") {
    return sendSuccess(res, { summary, myFeedback: null }, "Feedback summary");
  }

  const enrolled = await Enrollment.exists({ learnerId: req.user._id, courseId });
  if (!enrolled) {
    return sendSuccess(res, { summary, myFeedback: null }, "Feedback summary");
  }

  const myFeedback = await getMyFeedbackForCourse(req.user._id, courseId);
  return sendSuccess(res, { summary, myFeedback }, "Feedback fetched");
});

export const submit = asyncHandler(async (req, res) => {
  const row = await upsertFeedback(
    req.user._id,
    req.body.courseId,
    req.body.rating,
    req.body.comment
  );
  return sendSuccess(res, row, "Feedback saved", 201);
});
