import express from "express";
import { listUsers, getUserById } from "../controllers/userController.js";
import { auth, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(auth, requireRoles("admin"));

router.get("/", listUsers);
router.get("/:id", getUserById);

export default router;
