import api from "./axiosClient";

export const getFeedback = (courseId) => api.get(`/courses/${courseId}/feedback`);
export const submitFeedback = (courseId, rating, comment) =>
  api.post(`/courses/${courseId}/feedback`, { rating, comment });
