import { defineConfig } from "vitest/config";

// Fichier explicite nécessaire : sans lui, Vitest remonte jusqu'au
// vitest.config.js de la racine du repo (celui du frontend, avec son
// environnement jsdom et son setupFiles pointant vers src/setupTests.js
// côté frontend) et casse tous les tests backend.
export default defineConfig({
  test: {},
});
