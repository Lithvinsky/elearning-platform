import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "faculty", "learner"],
      required: true,
    },
    department: String,
    phone: String,
    bio: String,
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
