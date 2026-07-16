import { apiFetch } from "./client.js";

export function validateMove(board, placements) {
  return apiFetch("/api/game/validate-move", {
    method: "POST",
    body: JSON.stringify({ board, placements }),
  });
}

export function recordResult(result, score) {
  return apiFetch("/api/game/record-result", {
    method: "POST",
    body: JSON.stringify({ result, score }),
  });
}
