import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";

export async function listUsers() {
  return User.find().sort({ createdAt: -1 });
}

export async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) throw new AppError("User not found", 404);
  return user;
}

export async function updateProfile(userId, payload) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  user.name = payload.name ?? user.name;
  user.department = payload.department ?? user.department;
  user.phone = payload.phone ?? user.phone;
  user.bio = payload.bio ?? user.bio;
  await user.save();
  return user;
}
