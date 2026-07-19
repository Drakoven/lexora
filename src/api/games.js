import { apiFetch } from "./client.js";

export function createGame() {
  return apiFetch("/api/games", { method: "POST" });
}

export function createBotGame(difficulty) {
  return apiFetch("/api/games/bot", {
    method: "POST",
    body: JSON.stringify({ difficulty }),
  });
}

export function joinGame(code) {
  return apiFetch("/api/games/join", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function inviteFriend(friendUserId) {
  return apiFetch("/api/games/invite", {
    method: "POST",
    body: JSON.stringify({ friendUserId }),
  });
}

export function findRandomMatch() {
  return apiFetch("/api/games/matchmaking", { method: "POST" });
}

export function cancelGame(code) {
  return apiFetch(`/api/games/${code}/cancel`, { method: "POST" });
}

export function listGames() {
  return apiFetch("/api/games");
}

export function getGame(code) {
  return apiFetch(`/api/games/${code}`);
}

export function getMoves(code) {
  return apiFetch(`/api/games/${code}/moves`);
}

export function getAnalysis(code) {
  return apiFetch(`/api/games/${code}/analysis`);
}

export function previewMove(code, placements) {
  return apiFetch(`/api/games/${code}/preview`, {
    method: "POST",
    body: JSON.stringify({ placements }),
  });
}

export function submitMove(code, placements) {
  return apiFetch(`/api/games/${code}/move`, {
    method: "POST",
    body: JSON.stringify({ placements }),
  });
}

export function exchangeTiles(code, tiles) {
  return apiFetch(`/api/games/${code}/exchange`, {
    method: "POST",
    body: JSON.stringify({ tiles }),
  });
}

export function passTurn(code) {
  return apiFetch(`/api/games/${code}/pass`, { method: "POST" });
}

export function claimVictory(code) {
  return apiFetch(`/api/games/${code}/claim-victory`, { method: "POST" });
}
