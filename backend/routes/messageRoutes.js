import express from "express";
import { listMessages, postMessage } from "../controllers/messageController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/courses/:id/messages", auth, listMessages);
router.post("/courses/:id/messages", auth, postMessage);

export default router;
