import bcrypt from "bcryptjs";
import pool from "../config/db.js";

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

  res.status(201).json({ id: result.insertId, username, email });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  const [rows] = await pool.query(
    "SELECT id, username, email, password_hash FROM users WHERE email = ?",
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

  res.json({ id: user.id, username: user.username, email: user.email });
}

export function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.status(204).end();
  });
}

export async function me(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Non connecté." });
  }

  const [rows] = await pool.query(
    "SELECT id, username, email FROM users WHERE id = ?",
    [req.session.userId]
  );

  const user = rows[0];

  if (!user) {
    return res.status(401).json({ message: "Non connecté." });
  }

  res.json(user);
}
