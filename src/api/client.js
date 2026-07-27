export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    // Sans ça, le navigateur peut mettre en cache une réponse (ex. GET
    // /api/auth/me) et la revalider plus tard via ETag/If-None-Match : la
    // requête revient alors avec le statut 304, que `response.ok` traite
    // comme une erreur (seul 200-299 est "ok"), faisant passer une session
    // pourtant valide pour une déconnexion — c'était la vraie cause du bug
    // "obligé de se reconnecter à chaque réouverture".
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || "Une erreur est survenue.");
    error.status = response.status;
    throw error;
  }

  return data;
}
