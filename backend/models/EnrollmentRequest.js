import mongoose from "mongoose";

const enrollmentRequestSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    message: String,
  },
  { timestamps: true },
);

enrollmentRequestSchema.index({ learnerId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("EnrollmentRequest", enrollmentRequestSchema);
