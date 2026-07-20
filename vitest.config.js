import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Fichier séparé de vite.config.js : vite-plugin-pwa (strategies: injectManifest)
// fait des choses au build qui n'ont rien à voir avec l'exécution des tests,
// pas besoin de le charger ici.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.js"],
    globals: true,
    // Exclut server/ : c'est un projet Vitest séparé (environnement node,
    // sa propre config/scripts) — sans ça, `npx vitest run` à la racine
    // ramasse aussi ses tests par défaut et les fait tourner sous jsdom.
    include: ["src/**/*.test.{js,jsx}"],
  },
});
