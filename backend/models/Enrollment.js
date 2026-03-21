import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
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
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true },
);

enrollmentSchema.index({ learnerId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
