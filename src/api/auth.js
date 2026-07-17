import { apiFetch, API_URL } from "./client.js";

// Navigation complète (pas fetch) : le backend redirige vers Google/Facebook
// puis fixe la session côté serveur avant de rediriger vers le frontend.
export function oauthUrl(provider) {
  return `${API_URL}/api/auth/${provider}`;
}

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

export function forgotPassword(email) {
  return apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token, newPassword) {
  return apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export function verifyEmail(token) {
  return apiFetch("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function resendVerification() {
  return apiFetch("/api/auth/resend-verification", { method: "POST" });
}
