const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "faculty", "learner"],
      default: "learner",
    },
    department: String,
    phone: String,
    bio: String,
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
