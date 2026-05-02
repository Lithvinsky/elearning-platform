import axios from "axios";
import { store } from "../store";
import { clearSession, setAccessToken } from "../store/authSlice";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/$/,
  ""
);

export const apiBaseUrl = `${API_ORIGIN}/api`;

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (!original) return Promise.reject(error);
    const url = String(original.url || "");
    const isRefreshPath = url.includes("/auth/refresh");

    if (error.response?.status === 401 && !original._retry && !isRefreshPath) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = api
            .post("/auth/refresh")
            .then((res) => {
              const token = res.data?.data?.accessToken;
              if (token) store.dispatch(setAccessToken(token));
            })
            .finally(() => {
              refreshPromise = null;
            });
        }
        await refreshPromise;
        return api(original);
      } catch (refreshError) {
        store.dispatch(clearSession());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export function unwrap(response) {
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || "Request failed");
  }
  return body.data;
}
