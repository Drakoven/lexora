import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} from "../controllers/auth.controller.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/logout", logout);
router.get("/me", asyncHandler(me));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password", asyncHandler(resetPassword));
router.post("/verify-email", asyncHandler(verifyEmail));
router.post("/resend-verification", requireAuth, asyncHandler(resendVerification));

export default router;
