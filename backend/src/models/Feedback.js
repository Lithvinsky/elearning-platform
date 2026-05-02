import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

feedbackSchema.index({ learnerId: 1, courseId: 1 }, { unique: true });

export const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
