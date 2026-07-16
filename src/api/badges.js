import { apiFetch } from "./client.js";

export function getBadges() {
  return apiFetch("/api/badges");
}
