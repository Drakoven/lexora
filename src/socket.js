import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const socket = io(SOCKET_URL, {
  // Chemin explicite car le backend vit sous /api (lexora-jeu.fr/api) en
  // prod : sans ça, le client irait chercher /socket.io/ à la racine du
  // domaine, qui n'existe pas côté serveur. Doit matcher le "path" donné à
  // `new Server(...)` dans server/src/index.js.
  path: "/api/socket.io",
  withCredentials: true,
  autoConnect: false,
});
