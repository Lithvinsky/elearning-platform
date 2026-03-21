import api from "./axiosClient";

export const getUsers = (role) =>
  api.get("/users", { params: role ? { role } : {} });
export const getUser = (id) => api.get(`/users/${id}`);
