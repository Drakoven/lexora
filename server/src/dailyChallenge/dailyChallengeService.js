import pool from "../config/db.js";
import { validateMove as runValidateMove } from "../game/scoring.js";
import { canAfford } from "../game/rackUtils.js";

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

// Hash simple (djb2) : stable pour une même chaîne, utilisé uniquement pour
// choisir un index pseudo-aléatoire mais déterministe — pas un besoin
// cryptographique.
export function hashStringToInt(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

// Le défi du jour pioche un vrai coup de placement déjà joué sur Lexora
// (rackBefore/boardBefore capturés par submitMove, voir gamesService.js) et
// demande au joueur de faire mieux que le score réellement obtenu à ce
// moment-là. Uniquement les coups enregistrés AVANT aujourd'hui : ça garde
// l'ensemble éligible strictement stable sur toute la journée, même si de
// nouvelles parties se jouent en ce moment même (voir aussi
// daily_streak_last_date pour la même logique de date en VARCHAR côté
// utilisateur).
async function pickTodaysMove(today) {
  const [rows] = await pool.query(
    `SELECT id, detail, score FROM game_moves
     WHERE move_type = 'place' AND created_at < ?
     ORDER BY id`,
    [`${today} 00:00:00`]
  );
  const eligible = rows.filter((r) => r.detail?.rackBefore && r.detail?.boardBefore);
  if (eligible.length === 0) return null;

  const index = hashStringToInt(today) % eligible.length;
  return eligible[index];
}

export async function getTodaysChallenge(userId) {
  const today = todayDateString();
  const move = await pickTodaysMove(today);
  if (!move) return { available: false };

  const [attemptRows] = await pool.query(
    "SELECT target_score, your_score, words, won FROM daily_challenge_attempts WHERE user_id = ? AND challenge_date = ?",
    [userId, today]
  );

  if (attemptRows.length > 0) {
    const attempt = attemptRows[0];
    return {
      available: true,
      alreadyPlayed: true,
      targetScore: attempt.target_score,
      yourScore: attempt.your_score,
      words: attempt.words,
      won: !!attempt.won,
    };
  }

  return {
    available: true,
    alreadyPlayed: false,
    board: move.detail.boardBefore,
    rack: move.detail.rackBefore,
  };
}

export async function submitDailyChallenge(userId, placements) {
  const today = todayDateString();
  const move = await pickTodaysMove(today);
  if (!move) return { error: "Aucun défi disponible aujourd'hui." };

  const [attemptRows] = await pool.query(
    "SELECT id FROM daily_challenge_attempts WHERE user_id = ? AND challenge_date = ?",
    [userId, today]
  );
  if (attemptRows.length > 0) {
    return { error: "Tu as déjà joué le défi du jour." };
  }

  const rack = move.detail.rackBefore;
  const board = move.detail.boardBefore;

  if (!Array.isArray(placements) || placements.length === 0 || !canAfford(rack, placements)) {
    return { rejected: "Coup invalide (tuiles indisponibles)." };
  }

  const result = runValidateMove(board, placements);
  if (!result.accepted) {
    return { rejected: result.reason };
  }

  const targetScore = move.score;
  const won = result.score > targetScore;

  await pool.query(
    `INSERT INTO daily_challenge_attempts
       (user_id, challenge_date, move_id, target_score, your_score, words, won)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, today, move.id, targetScore, result.score, JSON.stringify(result.words), won]
  );

  return {
    accepted: true,
    yourScore: result.score,
    targetScore,
    words: result.words,
    won,
  };
}
