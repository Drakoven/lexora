import * as Sentry from "@sentry/node";
import * as repo from "./gamesRepository.js";
import * as gamesService from "./gamesService.js";
import { generateMoves } from "./moveGenerator.js";
import { getBotUserId } from "./botUser.js";
import { notifyMutationResult } from "./notifyMutation.js";

export async function maybeTriggerBotTurn(code, nextTurnUserId) {
  const botUserId = await getBotUserId();
  if (nextTurnUserId !== botUserId) return;

  const delay = 800 + Math.random() * 700; // pause "réflexion" crédible
  setTimeout(() => {
    playBotTurn(code, botUserId).catch((err) => {
      console.error(`[bot] échec du coup pour ${code}:`, err);
      Sentry.captureException(err); // sûr même sans SENTRY_DSN (no-op)
    });
  }, delay);
}

// Le rack le plus fort n'est joué qu'en difficile — en dessous, on pioche
// volontairement un coup plus faible dans les candidats déjà triés par
// score décroissant par generateMoves, sans toucher au moteur lui-même.
function pickMove(candidates, difficulty) {
  if (difficulty === "hard") return candidates[0];

  const poolStart =
    difficulty === "easy" ? Math.floor(candidates.length * 0.5) : 0;
  const poolEnd =
    difficulty === "easy" ? candidates.length : Math.max(1, Math.ceil(candidates.length * 0.3));
  const pool = candidates.slice(poolStart, poolEnd);

  return pool[Math.floor(Math.random() * pool.length)] || candidates[candidates.length - 1];
}

async function playBotTurn(code, botUserId) {
  const game = await repo.getGameByCode(code);
  if (!game || game.status !== "playing" || game.matchType !== "bot") return;

  const rack = game.player2Id === botUserId ? game.rack2 : game.rack1;
  const candidates = generateMoves(game.board, rack);
  const move = candidates.length > 0 ? pickMove(candidates, game.botDifficulty || "medium") : null;

  const result =
    move != null
      ? await gamesService.submitMove(code, botUserId, move.placements)
      : game.bag.length > 0
        ? await gamesService.exchangeTiles(code, botUserId, rack.slice(0, Math.min(rack.length, game.bag.length)))
        : await gamesService.passTurn(code, botUserId);

  if (result.error || result.rejected) {
    console.error("[bot] coup rejeté:", result);
    return;
  }

  notifyMutationResult(code, result);
}
