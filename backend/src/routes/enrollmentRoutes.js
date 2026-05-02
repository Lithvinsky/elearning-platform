import { Router } from "express";
import {
  enrollmentRequestsForUser,
  enrollmentsForUser,
  getRequests,
  myEnrollments,
  requestAccess,
  reviewRequest,
} from "../controllers/enrollmentController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateRequest } from "../middleware/errorHandler.js";
import {
  enrollmentRequestRules,
  mongoIdParam,
  reviewEnrollmentRules,
} from "../validation/schemas.js";

const router = Router();

router.use(requireAuth);

router.post("/requests", requireRole("learner"), enrollmentRequestRules, validateRequest, requestAccess);
router.get(
  "/requests",
  requireRole("admin", "faculty"),
  getRequests
);
router.patch(
  "/requests/:id",
  requireRole("admin", "faculty"),
  mongoIdParam("id"),
  reviewEnrollmentRules,
  validateRequest,
  reviewRequest
);
router.get(
  "/user/:userId/requests",
  mongoIdParam("userId"),
  validateRequest,
  enrollmentRequestsForUser
);
router.get(
  "/user/:userId",
  mongoIdParam("userId"),
  validateRequest,
  enrollmentsForUser
);
router.get("/me", requireRole("learner"), myEnrollments);

export default router;
