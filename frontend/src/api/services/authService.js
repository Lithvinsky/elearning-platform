import { api, unwrap } from "../axios";

export async function register(payload) {
  return unwrap(await api.post("/auth/register", payload));
}

export async function login(payload) {
  return unwrap(await api.post("/auth/login", payload));
}

export async function me() {
  return unwrap(await api.get("/auth/me"));
}

export async function logout() {
  return unwrap(await api.post("/auth/logout"));
}
