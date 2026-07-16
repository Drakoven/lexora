import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateMove, recordResult } from "../controllers/game.controller.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.post("/validate-move", validateMove);
router.post("/record-result", requireAuth, asyncHandler(recordResult));

export default router;
