import { api, unwrap } from "../axios";

/** Returns { summary: { averageRating, count }, myFeedback } — myFeedback only for enrolled learners */
export async function getCourseFeedback(courseId) {
  return unwrap(await api.get(`/feedback/course/${courseId}`));
}

export async function submitFeedback(payload) {
  return unwrap(await api.post("/feedback", payload));
}
