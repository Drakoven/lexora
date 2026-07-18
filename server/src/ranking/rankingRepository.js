import pool from "../config/db.js";
import { PLACEMENT_GAMES } from "./tiers.js";

export async function getLeaderboard(limit) {
  const [rows] = await pool.query(
    `SELECT id, username, avatar, rating, ranked_games
     FROM users
     WHERE ranked_games >= ?
     ORDER BY rating DESC, ranked_games DESC
     LIMIT ?`,
    [PLACEMENT_GAMES, limit]
  );
  return rows;
}

export async function getUserPosition(userId, rating) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM users WHERE ranked_games >= ? AND rating > ?`,
    [PLACEMENT_GAMES, rating]
  );
  return rows[0].count + 1;
}

export async function getRatingHistory(userId, limit = 100) {
  const [rows] = await pool.query(
    `SELECT rating, created_at FROM (
       SELECT rating, created_at FROM rating_history
       WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
     ) sub ORDER BY created_at ASC`,
    [userId, limit]
  );
  return rows;
}
