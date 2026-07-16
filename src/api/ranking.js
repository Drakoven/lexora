import { apiFetch } from "./client.js";

export function getLeaderboard(limit = 50) {
  return apiFetch(`/api/ranking/leaderboard?limit=${limit}`);
}
