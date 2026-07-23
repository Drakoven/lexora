import { Router } from "express";
import { getWordDefinitions } from "../controllers/dictionary.controller.js";
import { definitionLimiter } from "../middleware/rateLimiters.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Pas de requireAuth : les définitions sont une aide de lecture, accessible
// aussi en partie locale/invité (voir game.routes.js pour le même choix sur
// la validation de mots).
router.get("/:word/definitions", definitionLimiter, asyncHandler(getWordDefinitions));

export default router;
