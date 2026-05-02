import { Router } from "express";
import { getByCourse, submit } from "../controllers/feedbackController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateRequest } from "../middleware/errorHandler.js";
import { feedbackRules, mongoIdParam } from "../validation/schemas.js";

const router = Router();

router.use(requireAuth);

router.get("/course/:courseId", mongoIdParam("courseId"), validateRequest, getByCourse);
router.post("/", requireRole("learner"), feedbackRules, validateRequest, submit);

export default router;
