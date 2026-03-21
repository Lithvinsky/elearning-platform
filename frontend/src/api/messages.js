import api from "./axiosClient";

export const getMessages = (courseId) => api.get(`/courses/${courseId}/messages`);
export const postMessage = (courseId, body) =>
  api.post(`/courses/${courseId}/messages`, { body });
