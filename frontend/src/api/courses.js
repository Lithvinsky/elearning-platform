import api from "./axiosClient";

export const getCourses = () => api.get("/courses");
export const getCourse = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post("/courses", data);
export const updateCourse = (id, data) => api.patch(`/courses/${id}`, data);
export const addMaterialLink = (courseId, data) =>
  api.post(`/courses/${courseId}/materials/link`, data);
export const uploadMaterial = (courseId, formData) =>
  api.post(`/courses/${courseId}/materials/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteMaterial = (courseId, materialId) =>
  api.delete(`/courses/${courseId}/materials/${materialId}`);
export const requestCourseAccess = (courseId, message) =>
  api.post(`/courses/${courseId}/enroll-request`, { message });
