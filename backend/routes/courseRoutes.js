import express from "express";
import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  addMaterialLink,
  addMaterialUpload,
  removeMaterial,
} from "../controllers/courseController.js";
import { requestAccess } from "../controllers/enrollmentController.js";
import { auth, requireRoles } from "../middleware/authMiddleware.js";
import { uploadMaterial } from "../config/multer.js";

const router = express.Router();

router.get("/", auth, listCourses);
router.post("/", auth, requireRoles("admin"), createCourse);

router.post(
  "/:id/enroll-request",
  auth,
  requireRoles("learner"),
  requestAccess,
);

router.get("/:id", auth, getCourse);
router.patch("/:id", auth, requireRoles("admin", "faculty"), updateCourse);

router.post(
  "/:id/materials/link",
  auth,
  requireRoles("admin", "faculty"),
  addMaterialLink,
);
router.post(
  "/:id/materials/upload",
  auth,
  requireRoles("admin", "faculty"),
  uploadMaterial.single("file"),
  addMaterialUpload,
);
router.delete(
  "/:id/materials/:materialId",
  auth,
  requireRoles("admin", "faculty"),
  removeMaterial,
);

export default router;
