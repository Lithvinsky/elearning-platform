import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

export async function loadCourse(courseId) {
  return Course.findById(courseId).populate("facultyIds", "name email department");
}

export function isAdmin(role) {
  return role === "admin";
}

export function isAssignedFaculty(userId, course) {
  if (!course?.facultyIds?.length) return false;
  return course.facultyIds.some(
    (f) => String(f._id || f) === String(userId),
  );
}

export async function isEnrolledLearner(userId, courseId) {
  const e = await Enrollment.findOne({ learnerId: userId, courseId });
  return !!e;
}

/** Faculty assigned, admin, or enrolled learner */
export async function canAccessGroupChat(userId, role, course) {
  if (!course) return false;
  if (role === "admin") return true;
  if (role === "faculty" && isAssignedFaculty(userId, course)) return true;
  if (role === "learner" && (await isEnrolledLearner(userId, course._id))) {
    return true;
  }
  return false;
}

export function canEditCourse(userId, role, course) {
  if (!course) return false;
  if (role === "admin") return true;
  if (role === "faculty" && isAssignedFaculty(userId, course)) return true;
  return false;
}
