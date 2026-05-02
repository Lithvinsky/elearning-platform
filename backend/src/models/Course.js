import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["document", "video", "presentation", "link"],
      required: true,
    },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: "" },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    durationHours: { type: Number, default: 0, min: 0 },
    facultyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    materials: [materialSchema],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
