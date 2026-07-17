import pool from "../config/db.js";

export async function subscribe(req, res) {
  const { endpoint, keys } = req.body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ message: "Abonnement invalide." });
  }

  await pool.query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), p256dh = VALUES(p256dh), auth = VALUES(auth)`,
    [req.session.userId, endpoint, keys.p256dh, keys.auth]
  );

  res.status(204).end();
}

export async function unsubscribe(req, res) {
  const { endpoint } = req.body;

  if (!endpoint) {
    return res.status(400).json({ message: "Endpoint requis." });
  }

  await pool.query("DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?", [
    endpoint,
    req.session.userId,
  ]);

  res.status(204).end();
}
