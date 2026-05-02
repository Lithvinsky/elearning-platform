import { api, unwrap } from "../axios";

export async function requestEnrollment(payload) {
  return unwrap(await api.post("/enrollments/requests", payload));
}

export async function listEnrollmentRequests() {
  return unwrap(await api.get("/enrollments/requests"));
}

export async function reviewEnrollmentRequest(id, payload) {
  return unwrap(await api.patch(`/enrollments/requests/${id}`, payload));
}

export async function myEnrollments() {
  return unwrap(await api.get("/enrollments/me"));
}

export async function listEnrollmentsForUser(userId) {
  return unwrap(await api.get(`/enrollments/user/${userId}`));
}

/** Pending / rejected / approved request rows for this learner (same auth as enrollments). */
export async function listEnrollmentRequestsForUser(userId) {
  return unwrap(await api.get(`/enrollments/user/${userId}/requests`));
}
