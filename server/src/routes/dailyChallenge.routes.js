import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { getTodaysChallenge, getLeaderboard, submitDailyChallenge } from "../controllers/dailyChallenge.controller.js";
import { gameActionLimiter } from "../middleware/rateLimiters.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get("/", requireAuth, asyncHandler(getTodaysChallenge));
router.get("/leaderboard", requireAuth, asyncHandler(getLeaderboard));
router.post("/submit", requireAuth, gameActionLimiter, asyncHandler(submitDailyChallenge));

export default router;
