import { api, unwrap } from "../axios";

export async function listCourses() {
  return unwrap(await api.get("/courses"));
}

export async function getCourse(id) {
  return unwrap(await api.get(`/courses/${id}`));
}

export async function createCourse(payload) {
  return unwrap(await api.post("/courses", payload));
}

export async function updateCourse(id, payload) {
  return unwrap(await api.patch(`/courses/${id}`, payload));
}

export async function deleteCourse(id) {
  return unwrap(await api.delete(`/courses/${id}`));
}
