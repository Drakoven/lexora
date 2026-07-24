// Le navigateur ne redéclenchera jamais l'évènement "beforeinstallprompt" si
// on ne l'a pas capté à temps — ce module doit donc être importé le plus tôt
// possible (main.jsx) pour ne pas le manquer, indépendamment de la page sur
// laquelle l'utilisateur atterrit.
let deferredPrompt = null;
const listeners = new Set();

function notify() {
  for (const callback of listeners) callback(deferredPrompt);
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  notify();
});

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  notify();
});

export function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

// Safari iOS ne déclenche jamais "beforeinstallprompt" : seul un guide manuel
// (Partager -> Sur l'écran d'accueil) permet d'installer l'app sur cet OS.
export function isIos() {
  return (
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1)
  );
}

export function hasDeferredPrompt() {
  return deferredPrompt !== null;
}

export function onInstallPromptChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export async function promptInstall() {
  if (!deferredPrompt) return null;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  notify();
  return outcome;
}
