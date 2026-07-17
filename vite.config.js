import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // injectManifest (plutôt que le generateSW par défaut) : nécessaire
      // pour pouvoir écouter les évènements "push"/"notificationclick"
      // (notifications "à toi de jouer") dans un service worker qu'on
      // écrit nous-mêmes plutôt que de le laisser entièrement généré.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Lexora',
        short_name: 'Lexora',
        description: 'Un jeu de mots façon Scrabble, en local ou en ligne.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      injectManifest: {
        // Mêmes limites de taille par défaut que generateSW, sinon le
        // build échoue silencieusement sur de gros bundles.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      // Pas de devOptions.enabled : self.__WB_MANIFEST n'est pas fiable en
      // dev avec injectManifest (le SW plante à l'évaluation). Comme pour
      // le reste de la PWA, le service worker n'est actif que sur un vrai
      // build (`npm run build` + `npm run preview`, ou en prod) — c'est
      // déjà comme ça que le service worker avait été vérifié lors du
      // premier sprint PWA.
    }),
  ],
})
