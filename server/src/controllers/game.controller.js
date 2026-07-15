import pool from "../config/db.js";
import { validateMove as runValidateMove } from "../game/scoring.js";

export function validateMove(req, res) {
  const { board, placements } = req.body;

  if (!Array.isArray(board) || !Array.isArray(placements)) {
    return res.status(400).json({ accepted: false, reason: "Requête invalide." });
  }

  const result = runValidateMove(board, placements);
  res.json(result);
}

export async function recordResult(req, res) {
  const { result } = req.body;

  if (result !== "win" && result !== "loss") {
    return res.status(400).json({ message: "Résultat invalide." });
  }

  await pool.query(
    `UPDATE users SET
       games_played = games_played + 1,
       wins = wins + ?,
       losses = losses + ?
     WHERE id = ?`,
    [result === "win" ? 1 : 0, result === "loss" ? 1 : 0, req.session.userId]
  );

  res.status(204).end();
}
