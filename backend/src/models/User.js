import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "faculty", "learner"],
      default: "learner",
      index: true,
    },
    department: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    refreshTokenHash: { type: String, default: "", select: false },
  },
  { timestamps: true }
);

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    department: this.department,
    phone: this.phone,
    bio: this.bio,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
