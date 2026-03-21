import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";
import Enrollment from "../models/Enrollment.js";

export const listFeedback = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ error: "Invalid course id" });
    }
    const items = await Feedback.find({ courseId })
      .populate("learnerId", "name")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

export const upsertFeedback = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ error: "Invalid course id" });
    }
    if (req.user.role !== "learner") {
      return res.status(403).json({ error: "Only learners can submit feedback" });
    }
    const enrolled = await Enrollment.findOne({
      learnerId: req.user.id,
      courseId,
    });
    if (!enrolled) {
      return res
        .status(403)
        .json({ error: "You must be enrolled to leave feedback" });
    }
    const { rating, comment } = req.body;
    const r = Number(rating);
    if (Number.isNaN(r) || r < 1 || r > 5) {
      return res.status(400).json({ error: "rating must be 1–5" });
    }
    const fb = await Feedback.findOneAndUpdate(
      { learnerId: req.user.id, courseId },
      { rating: r, comment: comment ?? "" },
      { upsert: true, new: true },
    ).populate("learnerId", "name");
    res.json(fb);
  } catch (err) {
    next(err);
  }
};
