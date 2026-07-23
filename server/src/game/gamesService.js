import * as repo from "./gamesRepository.js";
import * as friendsRepo from "../friends/friendsRepository.js";
import { validateMove as runValidateMove } from "./scoring.js";
import { createBag, drawTiles, RACK_SIZE, LETTER_VALUES } from "./letters.js";
import { createEmptyBoard } from "./board.js";
import { applyRankedResult } from "../ranking/rankingService.js";
import { getRatingChangeForGame } from "../ranking/rankingRepository.js";
import { recordGameResult } from "../stats/statsService.js";
import { getBotUserId } from "./botUser.js";
import { generateMoves } from "./moveGenerator.js";
import { canAfford } from "./rackUtils.js";

export const TURN_HOURS = 48;
const TURN_MS = TURN_HOURS * 60 * 60 * 1000;
const MAX_CONSECUTIVE_PASSES = 4;

function rackValue(rack) {
  return rack.reduce((sum, tile) => sum + (tile.isBlank ? 0 : LETTER_VALUES[tile.letter]), 0);
}

function removeFromRack(rack, tiles) {
  const remaining = [...rack];
  for (const tile of tiles) {
    const idx = remaining.findIndex((t) => (tile.isBlank ? t.isBlank : !t.isBlank && t.letter === tile.letter));
    if (idx !== -1) remaining.splice(idx, 1);
  }
  return remaining;
}

function switchTurn(game) {
  game.currentPlayer = game.currentPlayer === 0 ? 1 : 0;
  game.turnStartedAt = new Date();
}

function currentTurnUserId(game) {
  return game.currentPlayer === 0 ? game.player1Id : game.player2Id;
}

async function finishGame(game, playerIndexWhoEmptiedRack) {
  const rack1Value = rackValue(game.rack1);
  const rack2Value = rackValue(game.rack2);

  if (playerIndexWhoEmptiedRack === 0) {
    game.score1 += rack2Value;
    game.score2 -= rack2Value;
  } else if (playerIndexWhoEmptiedRack === 1) {
    game.score2 += rack1Value;
    game.score1 -= rack1Value;
  } else {
    game.score1 -= rack1Value;
    game.score2 -= rack2Value;
  }

  game.status = "finished";
  game.winner = game.score1 === game.score2 ? null : game.score1 > game.score2 ? 0 : 1;

  const saved = await repo.saveGame(game);

  if (saved.winner !== null) {
    await recordGameResult(saved.player1Id, saved.winner === 0 ? "win" : "loss", saved.score1);
    await recordGameResult(saved.player2Id, saved.winner === 1 ? "win" : "loss", saved.score2);
  }

  if (saved.matchType === "random") {
    await applyRankedResult(saved.player1Id, saved.player2Id, saved.winner, saved.id);
  }

  return saved;
}

// Applique paresseusement les tours expirés (48h) — appelée à chaque lecture d'une partie.
async function checkTurnExpiry(game) {
  let current = game;
  let iterations = 0;

  while (
    current.status === "playing" &&
    current.turnStartedAt &&
    Date.now() - new Date(current.turnStartedAt).getTime() > TURN_MS &&
    iterations < MAX_CONSECUTIVE_PASSES
  ) {
    current.consecutivePasses += 1;
    iterations += 1;
    await repo.recordMove(current.id, current.currentPlayer, "pass", { auto: true }, 0);

    if (current.consecutivePasses >= MAX_CONSECUTIVE_PASSES) {
      current = await finishGame(current, null);
      break;
    }

    switchTurn(current);
    current = await repo.saveGame(current);
  }

  return current;
}

async function personalize(game, userId) {
  const isPlayer1 = game.player1Id === userId;
  const yourRack = isPlayer1 ? game.rack1 : game.rack2;
  const opponentRack = isPlayer1 ? game.rack2 : game.rack1;
  const yourPlayerIndex = isPlayer1 ? 0 : 1;

  const eloChange =
    game.status === "finished" && game.matchType === "random"
      ? await getRatingChangeForGame(userId, game.id)
      : null;

  return {
    code: game.code,
    status: game.status,
    board: game.board,
    yourRack,
    opponentRackSize: opponentRack.length,
    bagCount: game.bag.length,
    scores: [game.score1, game.score2],
    currentPlayerIndex: game.currentPlayer,
    isYourTurn: game.status === "playing" && game.currentPlayer === yourPlayerIndex,
    isOpponentTurnOverdue:
      game.status === "playing" &&
      game.currentPlayer !== yourPlayerIndex &&
      !!game.turnStartedAt &&
      Date.now() - new Date(game.turnStartedAt).getTime() > TURN_MS,
    turnStartedAt: game.turnStartedAt,
    turnHours: TURN_HOURS,
    players: [
      { username: game.player1?.username, avatar: game.player1?.avatar },
      game.player2Id ? { username: game.player2?.username, avatar: game.player2?.avatar } : null,
    ],
    winner: game.winner,
    matchType: game.matchType,
    invitedUser: game.invitedUser,
    eloChange,
  };
}

async function startGame(game, joinerUserId) {
  const bag = createBag();
  const { drawn: rack1, remaining: afterP1 } = drawTiles(bag, RACK_SIZE);
  const { drawn: rack2, remaining: afterP2 } = drawTiles(afterP1, RACK_SIZE);

  game.player2Id = joinerUserId;
  game.rack1 = rack1;
  game.rack2 = rack2;
  game.bag = afterP2;
  game.status = "playing";
  game.turnStartedAt = new Date();

  return repo.saveGame(game);
}

export async function createGame(userId, matchType = "code", invitedUserId = null) {
  const game = await repo.createGame({
    player1Id: userId,
    player2Id: null,
    board: createEmptyBoard(),
    bag: [],
    rack1: [],
    rack2: [],
    score1: 0,
    score2: 0,
    currentPlayer: 0,
    consecutivePasses: 0,
    status: "waiting",
    turnStartedAt: null,
    winner: null,
    matchType,
    invitedUserId,
  });
  return await personalize(game, userId);
}

const BOT_DIFFICULTIES = ["easy", "medium", "hard"];

export async function createBotGame(userId, difficulty) {
  const botUserId = await getBotUserId();
  const botDifficulty = BOT_DIFFICULTIES.includes(difficulty) ? difficulty : "medium";
  const game = await repo.createGame({
    player1Id: userId,
    player2Id: null,
    board: createEmptyBoard(),
    bag: [],
    rack1: [],
    rack2: [],
    score1: 0,
    score2: 0,
    currentPlayer: 0,
    consecutivePasses: 0,
    status: "waiting",
    turnStartedAt: null,
    winner: null,
    matchType: "bot",
    invitedUserId: null,
    botDifficulty,
  });
  const started = await startGame(game, botUserId);
  return await personalize(started, userId);
}

export async function inviteFriend(userId, friendUserId) {
  if (friendUserId === userId) return { error: "Tu ne peux pas t'inviter toi-même." };

  const friendship = await friendsRepo.findFriendship(userId, friendUserId);
  if (!friendship || friendship.status !== "accepted") {
    return { error: "Vous devez être amis pour vous inviter à jouer." };
  }

  const game = await createGame(userId, "friend", friendUserId);
  return { game };
}

export async function joinGame(code, userId) {
  const game = await repo.getGameByCode(code);
  if (!game) return { error: "Salle introuvable." };
  if (game.status !== "waiting") return { error: "Cette partie a déjà commencé." };
  if (game.player1Id === userId) return { error: "Tu ne peux pas rejoindre ta propre partie." };
  if (game.invitedUserId && game.invitedUserId !== userId) {
    return { error: "Cette partie est une invitation privée." };
  }

  const saved = await startGame(game, userId);
  return { game: await personalize(saved, userId) };
}

export async function findOrCreateRandomMatch(userId) {
  const waiting = await repo.findWaitingRandomGame(userId);

  if (waiting) {
    const saved = await startGame(waiting, userId);
    return { game: await personalize(saved, userId), matched: true };
  }

  const created = await createGame(userId, "random");
  return { game: created, matched: false };
}

export async function cancelWaitingGame(code, userId) {
  const game = await repo.getGameByCode(code);
  if (!game) return { error: "Partie introuvable." };
  if (game.player1Id !== userId) return { error: "Tu ne peux annuler que tes propres parties." };
  if (game.status !== "waiting") return { error: "Cette partie a déjà commencé." };

  await repo.deleteGame(game.id);
  return {};
}

export async function getPersonalizedGame(code, userId) {
  let game = await repo.getGameByCode(code);
  if (!game) return { error: "Partie introuvable." };
  if (game.player1Id !== userId && game.player2Id !== userId) return { error: "Tu ne fais pas partie de cette partie." };

  game = await checkTurnExpiry(game);
  return { game: await personalize(game, userId) };
}

export async function getMovesForGame(code, userId) {
  const game = await repo.getGameByCode(code);
  if (!game) return { error: "Partie introuvable." };
  if (game.player1Id !== userId && game.player2Id !== userId) return { error: "Tu ne fais pas partie de cette partie." };

  const moves = await repo.getMovesForGame(game.id);
  return { moves };
}

// Analyse post-partie ("meilleur coup manqué") : ne porte que sur les coups
// de placement du joueur qui demande l'analyse — pas ceux de l'adversaire
// (et surtout pas ceux du bot, qui sous-joue volontairement hors difficulté
// "difficile", ce qui n'aurait aucun sens à signaler comme un "coup manqué").
// rackBefore/boardBefore sont capturés au moment du coup (voir submitMove) ;
// les parties terminées avant l'ajout de ces champs restent simplement non
// analysables, sans erreur.
export async function getGameAnalysis(code, userId) {
  const game = await repo.getGameByCode(code);
  if (!game) return { error: "Partie introuvable." };
  if (game.player1Id !== userId && game.player2Id !== userId) return { error: "Tu ne fais pas partie de cette partie." };
  if (game.status !== "finished") return { error: "L'analyse n'est disponible qu'une fois la partie terminée." };

  const yourPlayerIndex = game.player1Id === userId ? 0 : 1;
  const moves = await repo.getMovesForGame(game.id);

  const analysis = moves
    .filter((move) => move.moveType === "place" && move.playerIndex === yourPlayerIndex)
    .map((move) => {
      const { words, rackBefore, boardBefore } = move.detail || {};
      if (!rackBefore || !boardBefore) return null;

      const candidates = generateMoves(boardBefore, rackBefore);
      const bestScore = candidates[0]?.score ?? move.score;
      return {
        createdAt: move.createdAt,
        words,
        score: move.score,
        bestScore,
        bestWords: bestScore > move.score ? candidates[0].words : null,
      };
    })
    .filter(Boolean);

  return { analysis };
}

export async function listGamesForUser(userId) {
  const games = await repo.getGamesForUser(userId);
  return games.map((game) => {
    const isPlayer1 = game.player1Id === userId;
    const isReceivedInvite = !isPlayer1 && game.player2Id === null && game.invitedUserId === userId;
    const isSentInvite = isPlayer1 && game.player2Id === null && !!game.invitedUserId;
    const opponent = isReceivedInvite ? game.player1 : isPlayer1 ? game.player2 : game.player1;
    const yourPlayerIndex = isPlayer1 ? 0 : 1;

    let kind = "game";
    if (isReceivedInvite) kind = "received-invite";
    else if (isSentInvite) kind = "sent-invite";

    return {
      code: game.code,
      status: game.status,
      kind,
      opponent,
      invitedUser: isSentInvite ? game.invitedUser : undefined,
      isYourTurn: game.status === "playing" && game.currentPlayer === yourPlayerIndex,
      scores: [game.score1, game.score2],
      updatedAt: game.updatedAt,
    };
  });
}

// Lecture seule : calcule le score d'un coup sans rien enregistrer ni
// changer de tour, pour l'aperçu en temps réel côté client. Réutilise
// exactement le même moteur que submitMove — le serveur reste le seul
// juge du mot/dictionnaire/score, même pour un simple aperçu.
export async function previewMove(code, userId, placements) {
  const game = await repo.getGameByCode(code);
  if (!game) return { error: "Partie introuvable." };
  if (game.player1Id !== userId && game.player2Id !== userId) {
    return { error: "Tu ne fais pas partie de cette partie." };
  }
  if (game.status !== "playing") return { error: "Cette partie n'est plus en cours." };

  const isPlayer1 = game.player1Id === userId;
  const rack = isPlayer1 ? game.rack1 : game.rack2;

  if (!Array.isArray(placements) || placements.length === 0 || !canAfford(rack, placements)) {
    return { rejected: "Coup invalide (tuiles indisponibles)." };
  }

  const result = runValidateMove(game.board, placements);
  if (!result.accepted) return { rejected: result.reason };
  return { accepted: true, score: result.score, words: result.words, isBingo: result.isBingo };
}

export async function submitMove(code, userId, placements) {
  let game = await repo.getGameByCode(code);
  if (!game) return { error: "Partie introuvable." };
  game = await checkTurnExpiry(game);
  if (game.status !== "playing") return { error: "Cette partie n'est plus en cours." };

  const isPlayer1 = game.player1Id === userId;
  const yourPlayerIndex = isPlayer1 ? 0 : 1;
  if (game.currentPlayer !== yourPlayerIndex) return { error: "Ce n'est pas ton tour." };

  const rackKey = isPlayer1 ? "rack1" : "rack2";
  const rack = game[rackKey];

  if (!Array.isArray(placements) || placements.length === 0 || !canAfford(rack, placements)) {
    return { rejected: "Coup invalide (tuiles indisponibles)." };
  }

  const result = runValidateMove(game.board, placements);
  if (!result.accepted) {
    return { rejected: result.reason };
  }

  // rackBefore/boardBefore alimentent l'analyse post-partie (meilleur coup
  // manqué) : un instantané complet évite d'avoir à rejouer l'historique
  // pour retrouver l'état du plateau/chevalet à ce moment précis. Capturé
  // ici, avant la mutation de game.board plus bas.
  await repo.recordMove(
    game.id,
    yourPlayerIndex,
    "place",
    { words: result.words, placements, rackBefore: rack, boardBefore: game.board },
    result.score
  );

  for (const p of placements) {
    game.board[p.row][p.col] = { letter: p.letter, isBlank: p.isBlank };
  }
  const remainingRack = removeFromRack(rack, placements);
  const { drawn, remaining: bag } = drawTiles(game.bag, RACK_SIZE - remainingRack.length);
  game[rackKey] = [...remainingRack, ...drawn];
  game.bag = bag;

  if (isPlayer1) game.score1 += result.score;
  else game.score2 += result.score;
  game.consecutivePasses = 0;

  const gameOver = game.bag.length === 0 && game[rackKey].length === 0;
  if (gameOver) {
    const finished = await finishGame(game, yourPlayerIndex);
    return { game: await personalize(finished, userId) };
  }

  switchTurn(game);
  const saved = await repo.saveGame(game);
  return { game: await personalize(saved, userId), nextTurnUserId: currentTurnUserId(saved) };
}

export async function exchangeTiles(code, userId, tiles) {
  let game = await repo.getGameByCode(code);
  if (!game) return { error: "Partie introuvable." };
  game = await checkTurnExpiry(game);
  if (game.status !== "playing") return { error: "Cette partie n'est plus en cours." };

  const isPlayer1 = game.player1Id === userId;
  const yourPlayerIndex = isPlayer1 ? 0 : 1;
  if (game.currentPlayer !== yourPlayerIndex) return { error: "Ce n'est pas ton tour." };

  const rackKey = isPlayer1 ? "rack1" : "rack2";
  const rack = game[rackKey];

  if (!Array.isArray(tiles) || tiles.length === 0 || !canAfford(rack, tiles)) {
    return { rejected: "Échange invalide." };
  }
  if (game.bag.length < tiles.length) {
    return { rejected: "Pas assez de lettres dans le sac." };
  }

  await repo.recordMove(game.id, yourPlayerIndex, "exchange", { tileCount: tiles.length }, 0);

  const keep = removeFromRack(rack, tiles);
  const bagWithReturns = [...game.bag, ...tiles.map(({ letter, isBlank }) => ({ letter, isBlank }))];
  const { drawn, remaining: bag } = drawTiles(bagWithReturns, tiles.length);
  game[rackKey] = [...keep, ...drawn];
  game.bag = bag;

  game.consecutivePasses += 1;
  if (game.consecutivePasses >= MAX_CONSECUTIVE_PASSES) {
    const finished = await finishGame(game, null);
    return { game: await personalize(finished, userId) };
  }

  switchTurn(game);
  const saved = await repo.saveGame(game);
  return { game: await personalize(saved, userId), nextTurnUserId: currentTurnUserId(saved) };
}

export async function passTurn(code, userId) {
  let game = await repo.getGameByCode(code);
  if (!game) return { error: "Partie introuvable." };
  game = await checkTurnExpiry(game);
  if (game.status !== "playing") return { error: "Cette partie n'est plus en cours." };

  const isPlayer1 = game.player1Id === userId;
  const yourPlayerIndex = isPlayer1 ? 0 : 1;
  if (game.currentPlayer !== yourPlayerIndex) return { error: "Ce n'est pas ton tour." };

  await repo.recordMove(game.id, yourPlayerIndex, "pass", null, 0);

  game.consecutivePasses += 1;
  if (game.consecutivePasses >= MAX_CONSECUTIVE_PASSES) {
    const finished = await finishGame(game, null);
    return { game: await personalize(finished, userId) };
  }

  switchTurn(game);
  const saved = await repo.saveGame(game);
  return { game: await personalize(saved, userId), nextTurnUserId: currentTurnUserId(saved) };
}

export async function claimVictory(code, userId) {
  let game = await repo.getGameByCode(code);
  if (!game) return { error: "Partie introuvable." };
  game = await checkTurnExpiry(game);
  if (game.status !== "playing") return { error: "Cette partie n'est plus en cours." };

  const isPlayer1 = game.player1Id === userId;
  const yourPlayerIndex = isPlayer1 ? 0 : 1;
  if (game.currentPlayer === yourPlayerIndex) return { error: "C'est ton tour, tu ne peux pas réclamer la victoire." };

  const overdue = game.turnStartedAt && Date.now() - new Date(game.turnStartedAt).getTime() > TURN_MS;
  if (!overdue) return { error: "Le tour de ton adversaire n'est pas encore en retard." };

  const finished = await finishGame(game, yourPlayerIndex);
  return { game: await personalize(finished, userId) };
}
