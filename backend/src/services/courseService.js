import { Course } from "../models/Course.js";
import { AppError } from "../utils/appError.js";

function isFacultyForCourse(course, user) {
  if (user.role !== "faculty") return false;
  const owners = course.facultyIds || [];
  return owners.some((id) => String(id?._id ?? id) === String(user._id));
}

export async function listCourses() {
  return Course.find({ isPublished: true })
    .populate("facultyIds", "name email role department")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });
}

export async function getCourseById(courseId) {
  const course = await Course.findById(courseId)
    .populate("facultyIds", "name email role department")
    .populate("createdBy", "name email role");
  if (!course) throw new AppError("Course not found", 404);
  return course;
}

/** Hide unpublished courses from learners (and faculty not assigned to the course). Admin always sees. */
export async function getCourseByIdForViewer(courseId, user) {
  const course = await getCourseById(courseId);
  if (course.isPublished !== false) return course;

  const isAdmin = user.role === "admin";
  if (isAdmin) return course;

  if (isFacultyForCourse(course, user)) return course;

  throw new AppError("Course not found", 404);
}

export async function createCourse(payload, user) {
  const { facultyIds: incomingFaculty, ...rest } = payload;

  if (user.role === "faculty") {
    return Course.create({
      ...rest,
      createdBy: user._id,
      facultyIds: [user._id],
    });
  }

  const facultyIds =
    Array.isArray(incomingFaculty) && incomingFaculty.length ? incomingFaculty : [];

  return Course.create({
    ...rest,
    createdBy: user._id,
    facultyIds,
  });
}

export async function updateCourse(courseId, payload, user) {
  const course = await Course.findById(courseId);
  if (!course) throw new AppError("Course not found", 404);
  const facultyAssigned = course.facultyIds.some((id) => String(id) === String(user._id));
  const canEdit = user.role === "admin" || (user.role === "faculty" && facultyAssigned);
  if (!canEdit) throw new AppError("Forbidden", 403);
  const updates = { ...payload };
  if (user.role === "faculty") {
    delete updates.facultyIds;
    delete updates.createdBy;
  }
  Object.assign(course, updates);
  await course.save();
  return course;
}

export async function deleteCourse(courseId, user) {
  if (user.role !== "admin") throw new AppError("Forbidden", 403);
  const deleted = await Course.findByIdAndDelete(courseId);
  if (!deleted) throw new AppError("Course not found", 404);
}
