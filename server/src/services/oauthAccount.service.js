import pool from "../config/db.js";
import { toAuthUser } from "../controllers/auth.controller.js";

const PROVIDER_COLUMNS = {
  google: "google_id",
  facebook: "facebook_id",
};

const USERNAME_MAX_LENGTH = 32;
const USERNAME_LOOKUP_ATTEMPTS = 20;

export class OAuthAccountError extends Error {
  constructor(code) {
    super(`Échec de connexion OAuth : ${code}`);
    this.code = code;
  }
}

function normalizeUsernameSeed(seed) {
  const normalized = (seed || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les accents (décomposés par NFD)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
  return normalized || "joueur";
}

async function generateUniqueUsername(seed) {
  const base = normalizeUsernameSeed(seed).slice(0, USERNAME_MAX_LENGTH - 2);

  for (let attempt = 0; attempt < USERNAME_LOOKUP_ATTEMPTS; attempt++) {
    const candidate = attempt === 0 ? base : `${base}${attempt + 1}`;
    const [rows] = await pool.query("SELECT id FROM users WHERE username = ?", [candidate]);
    if (rows.length === 0) return candidate;
  }

  const suffix = Math.random().toString(16).slice(2, 8);
  return `${base.slice(0, USERNAME_MAX_LENGTH - suffix.length)}${suffix}`;
}

async function findByProviderId(column, providerId) {
  const [rows] = await pool.query(
    `SELECT id, username, email, email_verified_at FROM users WHERE ${column} = ?`,
    [providerId]
  );
  return rows[0] || null;
}

export async function findOrCreateOAuthUser({ provider, providerId, email, displayName }) {
  if (!email) {
    throw new OAuthAccountError("email_missing");
  }

  const column = PROVIDER_COLUMNS[provider];

  const existingByProvider = await findByProviderId(column, providerId);
  if (existingByProvider) {
    return toAuthUser(existingByProvider);
  }

  try {
    const [byEmail] = await pool.query(
      "SELECT id, username, email, email_verified_at FROM users WHERE email = ?",
      [email]
    );

    if (byEmail[0]) {
      // Liaison automatique : l'email vient d'un provider qui en a déjà
      // vérifié la propriété, donc lier par email vérifié n'est pas un
      // abaissement de sécurité (même modèle que GitHub/Notion, etc.). Si le
      // compte existant n'avait jamais vérifié son email (bandeau de rappel
      // affiché), le provider vient d'en apporter la preuve — on marque
      // l'email vérifié dans la même écriture plutôt que de laisser le
      // bandeau s'afficher pour rien.
      if (byEmail[0].email_verified_at) {
        await pool.query(`UPDATE users SET ${column} = ? WHERE id = ?`, [providerId, byEmail[0].id]);
      } else {
        await pool.query(
          `UPDATE users SET ${column} = ?, email_verified_at = NOW() WHERE id = ?`,
          [providerId, byEmail[0].id]
        );
        byEmail[0].email_verified_at = new Date();
      }
      return toAuthUser(byEmail[0]);
    }

    const username = await generateUniqueUsername(displayName || email.split("@")[0]);

    const [result] = await pool.query(
      `INSERT INTO users (username, email, ${column}, password_hash, email_verified_at)
       VALUES (?, ?, ?, NULL, NOW())`,
      [username, email, providerId]
    );

    return toAuthUser({
      id: result.insertId,
      username,
      email,
      email_verified_at: new Date(),
    });
  } catch (err) {
    // Course entre deux requêtes concurrentes pour le même compte (double
    // clic, double onglet) : la ligne a pu être créée/liée entre notre
    // lookup et notre écriture. On re-tente le lookup par provider avant
    // d'abandonner — auto-guérison silencieuse plutôt qu'un 500 brut.
    if (err.code === "ER_DUP_ENTRY") {
      const recovered = await findByProviderId(column, providerId);
      if (recovered) return toAuthUser(recovered);
    }
    throw new OAuthAccountError("server_error");
  }
}
