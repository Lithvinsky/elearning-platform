import mongoose from "mongoose";

const enrollmentRequestSchema = new mongoose.Schema(
  {
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    note: { type: String, trim: true, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

enrollmentRequestSchema.index({ learnerId: 1, courseId: 1 }, { unique: true });

export const EnrollmentRequest =
  mongoose.models.EnrollmentRequest ||
  mongoose.model("EnrollmentRequest", enrollmentRequestSchema);
