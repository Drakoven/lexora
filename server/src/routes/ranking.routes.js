import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { getLeaderboard } from "../controllers/ranking.controller.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get("/leaderboard", requireAuth, asyncHandler(getLeaderboard));

export default router;
