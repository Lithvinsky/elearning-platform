import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true },
);

feedbackSchema.index({ learnerId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("Feedback", feedbackSchema);
