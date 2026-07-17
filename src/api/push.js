import { apiFetch } from "./client.js";

export function subscribePush(subscription) {
  return apiFetch("/api/push/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
  });
}

export function unsubscribePush(endpoint) {
  return apiFetch("/api/push/unsubscribe", {
    method: "POST",
    body: JSON.stringify({ endpoint }),
  });
}
