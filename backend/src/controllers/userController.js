import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/appError.js";
import { getUserById, listUsers, updateProfile } from "../services/userService.js";
import { getAchievementBadges } from "../services/achievementService.js";

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await listUsers();
  return sendSuccess(
    res,
    users.map((u) => u.toSafeObject()),
    "Users fetched"
  );
});

export const getUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const isAdmin = req.user.role === "admin";
  const isSelf = String(req.user._id) === String(id);
  if (!isAdmin && !isSelf) {
    throw new AppError("Forbidden", 403);
  }
  const user = await getUserById(id);
  return sendSuccess(res, user.toSafeObject(), "User fetched");
});

export const getAchievements = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const isAdmin = req.user.role === "admin";
  const isSelf = String(req.user._id) === String(userId);
  if (!isAdmin && !isSelf) {
    throw new AppError("Forbidden", 403);
  }
  const badges = await getAchievementBadges(userId);
  return sendSuccess(res, badges, "Achievements fetched");
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await updateProfile(req.user._id, req.body);
  return sendSuccess(res, user.toSafeObject(), "Profile updated");
});

export const updateUserByAdmin = asyncHandler(async (req, res) => {
  const user = await updateProfile(req.params.id, req.body);
  return sendSuccess(res, user.toSafeObject(), "User updated");
});
