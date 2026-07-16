import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { listBadges } from "../controllers/badges.controller.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get("/", requireAuth, asyncHandler(listBadges));

export default router;
