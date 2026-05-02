import { Router } from "express";
import { listByCourse, send } from "../controllers/messageController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/errorHandler.js";
import { messageRules, mongoIdParam } from "../validation/schemas.js";

const router = Router();

router.use(requireAuth);
router.get("/course/:courseId", mongoIdParam("courseId"), validateRequest, listByCourse);
router.post("/", messageRules, validateRequest, send);

export default router;
