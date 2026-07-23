import pool from "../config/db.js";

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(dateString, delta) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + delta);
  return toDateString(date);
}

// Série de jours consécutifs joués (concept distinct de current_streak, qui
// suit les victoires consécutives). Une partie jouée un jour donné compte
// une seule fois même si plusieurs parties sont terminées ce jour-là.
// Fonction pure (pas de Date.now() interne) pour rester facilement testable.
export function nextDailyStreak(currentStreak, lastDate, today) {
  if (lastDate === today) return currentStreak;
  return lastDate === addDays(today, -1) ? currentStreak + 1 : 1;
}

export async function recordGameResult(userId, result, score) {
  const isWin = result === "win";

  const [rows] = await pool.query(
    "SELECT current_streak, daily_streak_current, daily_streak_last_date FROM users WHERE id = ?",
    [userId]
  );
  const user = rows[0];
  const newStreak = isWin ? user.current_streak + 1 : 0;

  const today = toDateString(new Date());
  const dailyStreak = nextDailyStreak(user.daily_streak_current, user.daily_streak_last_date, today);

  await pool.query(
    `UPDATE users SET
       games_played = games_played + 1,
       wins = wins + ?,
       losses = losses + ?,
       current_streak = ?,
       best_streak = GREATEST(best_streak, ?),
       highest_score = GREATEST(highest_score, ?),
       daily_streak_current = ?,
       daily_streak_best = GREATEST(daily_streak_best, ?),
       daily_streak_last_date = ?
     WHERE id = ?`,
    [isWin ? 1 : 0, isWin ? 0 : 1, newStreak, newStreak, score, dailyStreak, dailyStreak, today, userId]
  );
}
