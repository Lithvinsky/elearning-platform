import { Router } from "express";
import { login, logout, me, refresh, register } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/errorHandler.js";
import { loginRules, registerRules } from "../validation/schemas.js";

const router = Router();

router.post("/register", registerRules, validateRequest, register);
router.post("/login", loginRules, validateRequest, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
