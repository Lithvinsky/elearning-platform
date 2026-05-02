import { Router } from "express";
import { create, getCourse, getCourses, remove, update } from "../controllers/courseController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateRequest } from "../middleware/errorHandler.js";
import { coursePatchRules, courseRules, mongoIdParam } from "../validation/schemas.js";

const router = Router();

router.get("/", getCourses);
router.get("/:id", requireAuth, mongoIdParam("id"), validateRequest, getCourse);
router.post(
  "/",
  requireAuth,
  requireRole("admin", "faculty"),
  courseRules,
  validateRequest,
  create
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin", "faculty"),
  mongoIdParam("id"),
  coursePatchRules,
  validateRequest,
  update
);
router.delete("/:id", requireAuth, requireRole("admin"), mongoIdParam("id"), validateRequest, remove);

export default router;
