import pool from "../config/db.js";
import { computeEloUpdate } from "../game/elo.js";

export async function applyRankedResult(player1Id, player2Id, winner, gameId) {
  const [rows] = await pool.query(
    "SELECT id, rating FROM users WHERE id IN (?, ?)",
    [player1Id, player2Id]
  );
  const rating1 = rows.find((r) => r.id === player1Id).rating;
  const rating2 = rows.find((r) => r.id === player2Id).rating;

  const score1 = winner === 0 ? 1 : winner === 1 ? 0 : 0.5;
  const { ratingA: newRating1, ratingB: newRating2 } = computeEloUpdate(rating1, rating2, score1);

  await pool.query(
    "UPDATE users SET rating = ?, ranked_games = ranked_games + 1, best_rating = GREATEST(best_rating, ?) WHERE id = ?",
    [newRating1, newRating1, player1Id]
  );
  await pool.query(
    "INSERT INTO rating_history (user_id, game_id, rating) VALUES (?, ?, ?)",
    [player1Id, gameId, newRating1]
  );

  await pool.query(
    "UPDATE users SET rating = ?, ranked_games = ranked_games + 1, best_rating = GREATEST(best_rating, ?) WHERE id = ?",
    [newRating2, newRating2, player2Id]
  );
  await pool.query(
    "INSERT INTO rating_history (user_id, game_id, rating) VALUES (?, ?, ?)",
    [player2Id, gameId, newRating2]
  );
}
