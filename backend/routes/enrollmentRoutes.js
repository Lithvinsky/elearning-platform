import express from "express";
import {
  listEnrollmentRequests,
  updateEnrollmentRequest,
  myEnrollments,
  updateProgress,
} from "../controllers/enrollmentController.js";
import { auth, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/requests",
  auth,
  requireRoles("admin", "faculty"),
  listEnrollmentRequests,
);
router.patch(
  "/requests/:requestId",
  auth,
  requireRoles("admin", "faculty"),
  updateEnrollmentRequest,
);

router.get("/my-courses", auth, requireRoles("learner"), myEnrollments);
router.patch(
  "/progress/:courseId",
  auth,
  requireRoles("learner"),
  updateProgress,
);

export default router;
