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

// "before" = la ligne d'historique juste avant celle de cette partie (par id,
// fiable même si deux lignes partagent le même created_at) ; 0 si c'était la
// toute première partie classée du joueur, comme le rating de départ réel.
export async function getRatingChangeForGame(userId, gameId) {
  const [rows] = await pool.query(
    "SELECT id, rating FROM rating_history WHERE user_id = ? AND game_id = ? ORDER BY id DESC LIMIT 1",
    [userId, gameId]
  );
  if (rows.length === 0) return null;

  const [prevRows] = await pool.query(
    "SELECT rating FROM rating_history WHERE user_id = ? AND id < ? ORDER BY id DESC LIMIT 1",
    [userId, rows[0].id]
  );

  return { before: prevRows.length > 0 ? prevRows[0].rating : 0, after: rows[0].rating };
}
