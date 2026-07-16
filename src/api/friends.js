import { apiFetch } from "./client.js";

export function sendRequest(username) {
  return apiFetch("/api/friends/request", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export function acceptRequest(id) {
  return apiFetch(`/api/friends/${id}/accept`, { method: "POST" });
}

export function declineOrRemove(id) {
  return apiFetch(`/api/friends/${id}/decline`, { method: "POST" });
}

export function listFriends() {
  return apiFetch("/api/friends");
}

export function listPendingRequests() {
  return apiFetch("/api/friends/requests");
}
