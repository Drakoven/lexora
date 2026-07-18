import * as gamesService from "../game/gamesService.js";
import { notifyMutationResult } from "../game/notifyMutation.js";
import * as botService from "../game/botService.js";

function respondMutation(res, code, result) {
  if (result.error) return res.status(400).json({ message: result.error });
  if (result.rejected) return res.json({ accepted: false, reason: result.rejected });
  notifyMutationResult(code, result);
  if (result.nextTurnUserId) {
    botService.maybeTriggerBotTurn(code, result.nextTurnUserId).catch((err) => {
      console.error("[bot] échec inattendu:", err);
    });
  }
  return res.json({ accepted: true, game: result.game });
}

export async function createGame(req, res) {
  const game = await gamesService.createGame(req.session.userId);
  res.status(201).json(game);
}

export async function createBotGame(req, res) {
  const game = await gamesService.createBotGame(req.session.userId);
  res.status(201).json(game);
}

export async function joinGame(req, res) {
  const code = (req.body.code || "").toUpperCase();
  const result = await gamesService.joinGame(code, req.session.userId);
  if (result.error) return res.status(400).json({ message: result.error });
  notifyGameUpdated(code);
  res.json(result.game);
}

export async function inviteFriend(req, res) {
  const friendUserId = Number(req.body.friendUserId);
  if (!friendUserId) return res.status(400).json({ message: "Ami invalide." });

  const result = await gamesService.inviteFriend(req.session.userId, friendUserId);
  if (result.error) return res.status(400).json({ message: result.error });
  res.status(201).json(result.game);
}

export async function findMatch(req, res) {
  const result = await gamesService.findOrCreateRandomMatch(req.session.userId);
  if (result.matched) notifyGameUpdated(result.game.code);
  res.json(result.game);
}

export async function cancelGame(req, res) {
  const code = req.params.code.toUpperCase();
  const result = await gamesService.cancelWaitingGame(code, req.session.userId);
  if (result.error) return res.status(400).json({ message: result.error });
  res.status(204).end();
}

export async function listGames(req, res) {
  const games = await gamesService.listGamesForUser(req.session.userId);
  res.json(games);
}

export async function getGame(req, res) {
  const result = await gamesService.getPersonalizedGame(req.params.code.toUpperCase(), req.session.userId);
  if (result.error) return res.status(404).json({ message: result.error });
  res.json(result.game);
}

export async function getMoves(req, res) {
  const result = await gamesService.getMovesForGame(req.params.code.toUpperCase(), req.session.userId);
  if (result.error) return res.status(404).json({ message: result.error });
  res.json(result.moves);
}

export async function submitMove(req, res) {
  const code = req.params.code.toUpperCase();
  const result = await gamesService.submitMove(code, req.session.userId, req.body.placements);
  respondMutation(res, code, result);
}

export async function exchangeTiles(req, res) {
  const code = req.params.code.toUpperCase();
  const result = await gamesService.exchangeTiles(code, req.session.userId, req.body.tiles);
  respondMutation(res, code, result);
}

export async function passTurn(req, res) {
  const code = req.params.code.toUpperCase();
  const result = await gamesService.passTurn(code, req.session.userId);
  respondMutation(res, code, result);
}

export async function claimVictory(req, res) {
  const code = req.params.code.toUpperCase();
  const result = await gamesService.claimVictory(code, req.session.userId);
  respondMutation(res, code, result);
}
