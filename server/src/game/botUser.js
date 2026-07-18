import pool from "../config/db.js";

const BOT_USERNAME = "Lexora Bot";
const BOT_EMAIL = "bot@lexora.internal";
const BOT_AVATAR = "owl";

let cachedBotUserId = null;

// Bootstrap idempotent plutôt qu'une migration data-seed : les migrations
// de ce projet sont du SQL manuel exécuté une fois via CLI, donc un seed
// glissé dedans risque d'être oublié sur un environnement. Ici, zéro étape
// manuelle au déploiement — même logique que SENTRY_DSN/SMTP_HOST qui
// gèrent déjà la présence/absence de config sans setup.
export async function getBotUserId() {
  if (cachedBotUserId) return cachedBotUserId;

  const [existing] = await pool.query("SELECT id FROM users WHERE username = ?", [BOT_USERNAME]);
  if (existing[0]) {
    cachedBotUserId = existing[0].id;
    return cachedBotUserId;
  }

  const [result] = await pool.query(
    "INSERT INTO users (username, email, password_hash, avatar) VALUES (?, ?, NULL, ?)",
    [BOT_USERNAME, BOT_EMAIL, BOT_AVATAR]
  );
  cachedBotUserId = result.insertId;
  return cachedBotUserId;
}
