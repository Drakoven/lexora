import { validateMove as runValidateMove } from "../game/scoring.js";
import { recordGameResult } from "../stats/statsService.js";

export function validateMove(req, res) {
  const { board, placements } = req.body;

  if (!Array.isArray(board) || !Array.isArray(placements)) {
    return res.status(400).json({ accepted: false, reason: "Requête invalide." });
  }

  const result = runValidateMove(board, placements);
  res.json(result);
}

export async function recordResult(req, res) {
  const { result, score } = req.body;

  if (result !== "win" && result !== "loss") {
    return res.status(400).json({ message: "Résultat invalide." });
  }
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return res.status(400).json({ message: "Score invalide." });
  }

  await recordGameResult(req.session.userId, result, score);

  res.status(204).end();
}
