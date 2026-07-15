import { apiFetch } from "./client.js";

export function getProfile() {
  return apiFetch("/api/profile/me");
}

export function updateAvatar(avatar) {
  return apiFetch("/api/profile/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });
}
