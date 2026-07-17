import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "../config/db.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../email/emailService.js";

const RESET_TOKEN_HOURS = 1;
const VERIFY_TOKEN_HOURS = 48;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function toAuthUser(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    emailVerified: !!row.email_verified_at,
  };
}

async function issueVerificationEmail(userId, email) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + VERIFY_TOKEN_HOURS * 60 * 60 * 1000);

  await pool.query(
    "UPDATE users SET email_verify_token_hash = ?, email_verify_token_expires_at = ? WHERE id = ?",
    [hashToken(token), expiresAt, userId]
  );

  const verifyUrl = `${process.env.CLIENT_ORIGIN}/verify-email?token=${token}`;
  await sendVerificationEmail(email, verifyUrl);
}

export async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  const [existing] = await pool.query(
    "SELECT id FROM users WHERE email = ? OR username = ?",
    [email, username]
  );

  if (existing.length > 0) {
    return res
      .status(409)
      .json({ message: "Ce pseudo ou cet email est déjà utilisé." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
    [username, email, passwordHash]
  );

  req.session.userId = result.insertId;

  try {
    await issueVerificationEmail(result.insertId, email);
  } catch {
    // L'inscription ne doit pas échouer si l'envoi de l'email échoue —
    // l'utilisateur peut toujours redemander un email depuis le bandeau.
  }

  res.status(201).json({ id: result.insertId, username, email, emailVerified: false });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  const [rows] = await pool.query(
    "SELECT id, username, email, password_hash, email_verified_at FROM users WHERE email = ?",
    [email]
  );

  const user = rows[0];

  if (!user) {
    return res.status(401).json({ message: "Identifiants invalides." });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return res.status(401).json({ message: "Identifiants invalides." });
  }

  req.session.userId = user.id;

  res.json(toAuthUser(user));
}

export function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.status(204).end();
  });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email requis." });
  }

  const [rows] = await pool.query("SELECT id, email FROM users WHERE email = ?", [email]);
  const user = rows[0];

  // Toujours une réponse générique, qu'un compte existe ou non, pour ne pas
  // permettre de deviner quels emails sont inscrits (énumération de comptes).
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_HOURS * 60 * 60 * 1000);

    await pool.query(
      "UPDATE users SET reset_token_hash = ?, reset_token_expires_at = ? WHERE id = ?",
      [hashToken(token), expiresAt, user.id]
    );

    const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  res.status(204).end();
}

export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Requête invalide." });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
  }

  const [rows] = await pool.query(
    "SELECT id FROM users WHERE reset_token_hash = ? AND reset_token_expires_at > NOW()",
    [hashToken(token)]
  );
  const user = rows[0];

  if (!user) {
    return res.status(400).json({ message: "Ce lien est invalide ou a expiré." });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await pool.query(
    "UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?",
    [passwordHash, user.id]
  );

  res.status(204).end();
}

export async function me(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Non connecté." });
  }

  const [rows] = await pool.query(
    "SELECT id, username, email, email_verified_at FROM users WHERE id = ?",
    [req.session.userId]
  );

  const user = rows[0];

  if (!user) {
    return res.status(401).json({ message: "Non connecté." });
  }

  res.json(toAuthUser(user));
}

export async function verifyEmail(req, res) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Requête invalide." });
  }

  const [rows] = await pool.query(
    "SELECT id FROM users WHERE email_verify_token_hash = ? AND email_verify_token_expires_at > NOW()",
    [hashToken(token)]
  );
  const user = rows[0];

  if (!user) {
    return res.status(400).json({ message: "Ce lien est invalide ou a expiré." });
  }

  await pool.query(
    "UPDATE users SET email_verified_at = NOW(), email_verify_token_hash = NULL, email_verify_token_expires_at = NULL WHERE id = ?",
    [user.id]
  );

  res.status(204).end();
}

export async function resendVerification(req, res) {
  const [rows] = await pool.query(
    "SELECT id, email, email_verified_at FROM users WHERE id = ?",
    [req.session.userId]
  );
  const user = rows[0];

  if (!user) {
    return res.status(401).json({ message: "Non connecté." });
  }
  if (user.email_verified_at) {
    return res.status(400).json({ message: "Ton email est déjà vérifié." });
  }

  await issueVerificationEmail(user.id, user.email);

  res.status(204).end();
}
