import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import './pwa/installPrompt.js'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

// Optionnel : n'active Sentry que si un DSN est fourni au build, pour que
// le dev local n'ait pas besoin d'un compte Sentry.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
  })
}

// Enregistrement explicite plutôt que de compter sur l'injection automatique
// du plugin PWA (peu fiable en dev avec injectManifest) — nécessaire pour
// que navigator.serviceWorker.ready se résolve (notifications push).
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
