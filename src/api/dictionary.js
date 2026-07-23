import { apiFetch } from "./client.js";

export function getDefinitions(word) {
  return apiFetch(`/api/dictionary/${encodeURIComponent(word)}/definitions`);
}
