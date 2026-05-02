import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

messageSchema.index({ courseId: 1, createdAt: -1 });

export const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
