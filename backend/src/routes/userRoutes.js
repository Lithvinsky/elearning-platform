import { Router } from "express";
import {
  getAchievements,
  getUser,
  getUsers,
  updateMe,
  updateUserByAdmin,
} from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateRequest } from "../middleware/errorHandler.js";
import { mongoIdParam, profileUpdateRules } from "../validation/schemas.js";

const router = Router();

router.use(requireAuth);
router.get("/", requireRole("admin"), getUsers);
router.patch("/me", profileUpdateRules, validateRequest, updateMe);
router.patch(
  "/:id",
  requireRole("admin"),
  mongoIdParam("id"),
  profileUpdateRules,
  validateRequest,
  updateUserByAdmin
);
router.get("/:id/achievements", mongoIdParam("id"), validateRequest, getAchievements);
router.get("/:id", mongoIdParam("id"), validateRequest, getUser);

export default router;
