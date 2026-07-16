import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createGame,
  joinGame,
  inviteFriend,
  findMatch,
  cancelGame,
  listGames,
  getGame,
  getMoves,
  submitMove,
  exchangeTiles,
  passTurn,
  claimVictory,
} from "../controllers/games.controller.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.post("/", requireAuth, asyncHandler(createGame));
router.post("/join", requireAuth, asyncHandler(joinGame));
router.post("/invite", requireAuth, asyncHandler(inviteFriend));
router.post("/matchmaking", requireAuth, asyncHandler(findMatch));
router.get("/", requireAuth, asyncHandler(listGames));
router.get("/:code", requireAuth, asyncHandler(getGame));
router.get("/:code/moves", requireAuth, asyncHandler(getMoves));
router.post("/:code/move", requireAuth, asyncHandler(submitMove));
router.post("/:code/exchange", requireAuth, asyncHandler(exchangeTiles));
router.post("/:code/pass", requireAuth, asyncHandler(passTurn));
router.post("/:code/claim-victory", requireAuth, asyncHandler(claimVictory));
router.post("/:code/cancel", requireAuth, asyncHandler(cancelGame));

export default router;
