import { api, unwrap } from "../axios";

export async function listCourseMessages(courseId) {
  return unwrap(await api.get(`/messages/course/${courseId}`));
}

export async function sendCourseMessage(payload) {
  return unwrap(await api.post("/messages", payload));
}
