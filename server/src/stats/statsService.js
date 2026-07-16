import pool from "../config/db.js";

export async function recordGameResult(userId, result, score) {
  const isWin = result === "win";

  const [rows] = await pool.query("SELECT current_streak FROM users WHERE id = ?", [userId]);
  const newStreak = isWin ? rows[0].current_streak + 1 : 0;

  await pool.query(
    `UPDATE users SET
       games_played = games_played + 1,
       wins = wins + ?,
       losses = losses + ?,
       current_streak = ?,
       best_streak = GREATEST(best_streak, ?),
       highest_score = GREATEST(highest_score, ?)
     WHERE id = ?`,
    [isWin ? 1 : 0, isWin ? 0 : 1, newStreak, newStreak, score, userId]
  );
}
