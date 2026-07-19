import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { gameActionLimiter, gamePreviewLimiter } from "../middleware/rateLimiters.js";
import {
  createGame,
  createBotGame,
  joinGame,
  inviteFriend,
  findMatch,
  cancelGame,
  listGames,
  getGame,
  getMoves,
  getAnalysis,
  previewMove,
  submitMove,
  exchangeTiles,
  passTurn,
  claimVictory,
} from "../controllers/games.controller.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.post("/", requireAuth, gameActionLimiter, asyncHandler(createGame));
router.post("/bot", requireAuth, gameActionLimiter, asyncHandler(createBotGame));
router.post("/join", requireAuth, gameActionLimiter, asyncHandler(joinGame));
router.post("/invite", requireAuth, gameActionLimiter, asyncHandler(inviteFriend));
router.post("/matchmaking", requireAuth, gameActionLimiter, asyncHandler(findMatch));
router.get("/", requireAuth, asyncHandler(listGames));
router.get("/:code", requireAuth, asyncHandler(getGame));
router.get("/:code/moves", requireAuth, asyncHandler(getMoves));
router.get("/:code/analysis", requireAuth, gameActionLimiter, asyncHandler(getAnalysis));
router.post("/:code/preview", requireAuth, gamePreviewLimiter, asyncHandler(previewMove));
router.post("/:code/move", requireAuth, gameActionLimiter, asyncHandler(submitMove));
router.post("/:code/exchange", requireAuth, gameActionLimiter, asyncHandler(exchangeTiles));
router.post("/:code/pass", requireAuth, gameActionLimiter, asyncHandler(passTurn));
router.post("/:code/claim-victory", requireAuth, gameActionLimiter, asyncHandler(claimVictory));
router.post("/:code/cancel", requireAuth, gameActionLimiter, asyncHandler(cancelGame));

export default router;
