import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { subscribe, unsubscribe } from "../controllers/push.controller.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.post("/subscribe", requireAuth, asyncHandler(subscribe));
router.post("/unsubscribe", requireAuth, asyncHandler(unsubscribe));

export default router;
