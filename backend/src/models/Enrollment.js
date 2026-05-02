import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    progressPercent: { type: Number, min: 0, max: 100, default: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

enrollmentSchema.index({ learnerId: 1, courseId: 1 }, { unique: true });

export const Enrollment =
  mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);
