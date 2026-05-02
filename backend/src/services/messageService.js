import { Message } from "../models/Message.js";
import { Enrollment } from "../models/Enrollment.js";
import { Course } from "../models/Course.js";
import { AppError } from "../utils/appError.js";

async function canAccessCourseChat(user, courseId) {
  if (user.role === "admin") return true;
  if (user.role === "faculty") {
    const teaches = await Course.exists({ _id: courseId, facultyIds: user._id });
    if (teaches) return true;
  }
  if (user.role === "learner") {
    const enrolled = await Enrollment.exists({ learnerId: user._id, courseId });
    if (enrolled) return true;
  }
  return false;
}

export async function listCourseMessages(user, courseId, limit = 100) {
  const allowed = await canAccessCourseChat(user, courseId);
  if (!allowed) throw new AppError("Forbidden", 403);
  return Message.find({ courseId })
    .populate("senderId", "name role")
    .sort({ createdAt: -1 })
    .limit(limit);
}

export async function sendCourseMessage(user, courseId, content) {
  const allowed = await canAccessCourseChat(user, courseId);
  if (!allowed) throw new AppError("Forbidden", 403);
  return Message.create({
    courseId,
    senderId: user._id,
    content,
  });
}
