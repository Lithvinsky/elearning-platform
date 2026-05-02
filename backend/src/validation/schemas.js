import { body, param } from "express-validator";

const MATERIAL_TYPES = ["document", "video", "presentation", "link"];

export const mongoIdParam = (name = "id") =>
  param(name).isMongoId().withMessage(`${name} must be a valid id`);

const materialItemRules = [
  body("materials.*.title").trim().isLength({ min: 1, max: 300 }),
  body("materials.*.type").isIn(MATERIAL_TYPES),
  body("materials.*.url").trim().isLength({ min: 4, max: 2000 }),
];

export const registerRules = [
  body("name").trim().isLength({ min: 2 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("role").optional().isIn(["admin", "faculty", "learner"]),
];

export const loginRules = [body("email").isEmail(), body("password").isLength({ min: 1 })];

export const courseRules = [
  body("title").trim().isLength({ min: 3 }),
  body("description").trim().isLength({ min: 10 }),
  body("category").optional().trim().isLength({ max: 120 }),
  body("level").optional().isIn(["beginner", "intermediate", "advanced"]),
  body("durationHours").optional().isFloat({ min: 0 }),
  body("facultyIds").optional().isArray(),
  body("facultyIds.*").isMongoId(),
  body("isPublished").optional().isBoolean(),
  body("materials").optional().isArray(),
  ...materialItemRules,
];

export const coursePatchRules = [
  body("title").optional().trim().isLength({ min: 3 }),
  body("description").optional().trim().isLength({ min: 10 }),
  body("category").optional().trim().isLength({ max: 120 }),
  body("level").optional().isIn(["beginner", "intermediate", "advanced"]),
  body("durationHours").optional().isFloat({ min: 0 }),
  body("facultyIds").optional().isArray(),
  body("facultyIds.*").isMongoId(),
  body("isPublished").optional().isBoolean(),
  body("materials").optional().isArray(),
  ...materialItemRules,
];

export const enrollmentRequestRules = [
  body("courseId").isMongoId(),
  body("note").optional().isString().isLength({ max: 500 }),
];

export const reviewEnrollmentRules = [
  body("status").isIn(["approved", "rejected"]),
];

export const feedbackRules = [
  body("courseId").isMongoId(),
  body("rating").isInt({ min: 1, max: 5 }),
  body("comment").optional().isString().isLength({ max: 1000 }),
];

export const messageRules = [
  body("courseId").isMongoId(),
  body("content").trim().isLength({ min: 1, max: 2000 }),
];

export const profileUpdateRules = [
  body("name").optional().trim().isLength({ min: 2 }),
  body("department").optional().isString().isLength({ max: 120 }),
  body("phone").optional().isString().isLength({ max: 50 }),
  body("bio").optional().isString().isLength({ max: 1000 }),
];
