import api from "./axiosClient";

export const getEnrollmentRequests = () => api.get("/enrollments/requests");
export const updateEnrollmentRequest = (requestId, status) =>
  api.patch(`/enrollments/requests/${requestId}`, { status });
export const getMyEnrollments = () => api.get("/enrollments/my-courses");
export const updateProgress = (courseId, progressPercent) =>
  api.patch(`/enrollments/progress/${courseId}`, { progressPercent });
