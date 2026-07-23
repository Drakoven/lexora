import { apiFetch } from "./client.js";

export function getTodaysChallenge() {
  return apiFetch("/api/daily-challenge");
}

export function submitDailyChallenge(placements) {
  return apiFetch("/api/daily-challenge/submit", {
    method: "POST",
    body: JSON.stringify({ placements }),
  });
}
