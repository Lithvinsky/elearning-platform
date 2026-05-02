import { api, unwrap } from "../axios";

export async function listUsers() {
  return unwrap(await api.get("/users"));
}

export async function getUser(id) {
  return unwrap(await api.get(`/users/${id}`));
}

export async function getUserAchievements(userId) {
  return unwrap(await api.get(`/users/${userId}/achievements`));
}

export async function updateMyProfile(payload) {
  return unwrap(await api.patch("/users/me", payload));
}

export async function updateUser(userId, payload) {
  return unwrap(await api.patch(`/users/${userId}`, payload));
}
