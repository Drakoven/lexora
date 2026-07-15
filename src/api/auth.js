import { apiFetch } from "./client.js";

export function register({ username, email, password }) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export function login({ email, password }) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return apiFetch("/api/auth/logout", { method: "POST" });
}

export function me() {
  return apiFetch("/api/auth/me");
}
