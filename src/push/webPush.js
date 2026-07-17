import { subscribePush, unsubscribePush } from "../api/push.js";

export function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

// Conversion standard clé VAPID base64url -> Uint8Array, exigée par
// pushManager.subscribe() (applicationServerKey).
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function getSubscriptionState() {
  if (!isPushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? "subscribed" : "unsubscribed";
}

export async function subscribeToPush() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Permission refusée.");

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
  });

  await subscribePush(subscription.toJSON());
}

export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  await unsubscribePush(subscription.endpoint);
  await subscription.unsubscribe();
}
