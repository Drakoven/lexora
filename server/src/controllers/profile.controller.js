import pool from "../config/db.js";
import { AVATAR_KEYS } from "../constants/avatars.js";

function toProfile(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatar: row.avatar,
    gamesPlayed: row.games_played,
    wins: row.wins,
    losses: row.losses,
    createdAt: row.created_at,
  };
}

export async function getProfile(req, res) {
  const [rows] = await pool.query(
    "SELECT id, username, email, avatar, games_played, wins, losses, created_at FROM users WHERE id = ?",
    [req.session.userId]
  );

  const user = rows[0];

  if (!user) {
    return res.status(401).json({ message: "Non connecté." });
  }

  res.json(toProfile(user));
}

export async function updateAvatar(req, res) {
  const { avatar } = req.body;

  if (!AVATAR_KEYS.includes(avatar)) {
    return res.status(400).json({ message: "Avatar invalide." });
  }

  await pool.query("UPDATE users SET avatar = ? WHERE id = ?", [
    avatar,
    req.session.userId,
  ]);

  const [rows] = await pool.query(
    "SELECT id, username, email, avatar, games_played, wins, losses, created_at FROM users WHERE id = ?",
    [req.session.userId]
  );

  res.json(toProfile(rows[0]));
}
