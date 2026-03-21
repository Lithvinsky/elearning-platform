import express from "express";
import { listFeedback, upsertFeedback } from "../controllers/feedbackController.js";
import { auth, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/courses/:id/feedback", auth, listFeedback);
router.post(
  "/courses/:id/feedback",
  auth,
  requireRoles("learner"),
  upsertFeedback,
);

export default router;
