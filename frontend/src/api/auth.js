import api from "./axiosClient";

export const registerUser = (payload) => api.post("/auth/register", payload);
export const loginUser = (email, password) =>
  api.post("/auth/login", { email, password });
export const getProfile = () => api.get("/auth/me");
export const updateProfile = (payload) => api.patch("/auth/profile", payload);
