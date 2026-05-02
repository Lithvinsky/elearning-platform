import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  createCourse,
  deleteCourse,
  getCourseByIdForViewer,
  listCourses,
  updateCourse,
} from "../services/courseService.js";

export const getCourses = asyncHandler(async (_req, res) => {
  const courses = await listCourses();
  return sendSuccess(res, courses, "Courses fetched");
});

export const getCourse = asyncHandler(async (req, res) => {
  const course = await getCourseByIdForViewer(req.params.id, req.user);
  return sendSuccess(res, course, "Course fetched");
});

export const create = asyncHandler(async (req, res) => {
  const course = await createCourse(req.body, req.user);
  return sendSuccess(res, course, "Course created", 201);
});

export const update = asyncHandler(async (req, res) => {
  const course = await updateCourse(req.params.id, req.body, req.user);
  return sendSuccess(res, course, "Course updated");
});

export const remove = asyncHandler(async (req, res) => {
  await deleteCourse(req.params.id, req.user);
  return sendSuccess(res, null, "Course deleted");
});
