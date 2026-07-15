import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { getProfile, updateAvatar } from "../controllers/profile.controller.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get("/me", requireAuth, asyncHandler(getProfile));
router.patch("/avatar", requireAuth, asyncHandler(updateAvatar));

export default router;
