import webpush from "web-push";
import pool from "../config/db.js";

let configured = false;

function ensureConfigured() {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return false;

  if (!configured) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:contact@lexora-jeu.fr",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    configured = true;
  }

  return true;
}

export async function sendPushToUser(userId, { title, body, url }) {
  // Pas de clés VAPID configurées (dev local) : no-op silencieux, comme
  // emailService.js sans SMTP_HOST — pas besoin de config pour développer.
  if (!ensureConfigured()) return;

  const [subscriptions] = await pool.query(
    "SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?",
    [userId]
  );

  const payload = JSON.stringify({ title, body, url });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
      } catch (err) {
        // 404/410 = l'abonnement n'existe plus côté navigateur (désinstallé,
        // permission révoquée...) — on nettoie plutôt que de réessayer indéfiniment.
        if (err.statusCode === 404 || err.statusCode === 410) {
          await pool.query("DELETE FROM push_subscriptions WHERE id = ?", [sub.id]);
        } else {
          console.error("[push] échec d'envoi:", err.message);
        }
      }
    })
  );
}
