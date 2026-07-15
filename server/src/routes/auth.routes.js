import { Router } from "express";
import { register, login, logout, me } from "../controllers/auth.controller.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/logout", logout);
router.get("/me", asyncHandler(me));

export default router;
