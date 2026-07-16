import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  sendRequest,
  acceptRequest,
  declineOrRemove,
  listFriends,
  listPendingRequests,
} from "../controllers/friends.controller.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.post("/request", requireAuth, asyncHandler(sendRequest));
router.post("/:id/accept", requireAuth, asyncHandler(acceptRequest));
router.post("/:id/decline", requireAuth, asyncHandler(declineOrRemove));
router.get("/", requireAuth, asyncHandler(listFriends));
router.get("/requests", requireAuth, asyncHandler(listPendingRequests));

export default router;
