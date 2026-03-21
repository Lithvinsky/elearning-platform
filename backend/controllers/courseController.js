import mongoose from "mongoose";
import Course from "../models/Course.js";
import Feedback from "../models/Feedback.js";
import {
  loadCourse,
  canEditCourse,
} from "../utils/courseAccess.js";

export const listCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate("facultyIds", "name email department")
      .populate("createdBy", "name email")
      .sort({ updatedAt: -1 });
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid course id" });
    }
    const course = await loadCourse(id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const feedbacks = await Feedback.find({ courseId: id });
    const avgRating =
      feedbacks.length > 0
        ? feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length
        : null;

    res.json({
      course,
      feedbackSummary: {
        count: feedbacks.length,
        averageRating: avgRating != null ? Math.round(avgRating * 10) / 10 : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { title, description, facultyIds, durationHours, level, coverImage } =
      req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    let faculty = facultyIds;
    if (typeof faculty === "string") {
      try {
        faculty = JSON.parse(faculty);
      } catch {
        faculty = [];
      }
    }
    if (!Array.isArray(faculty)) faculty = [];
    const validFaculty = faculty.filter((id) => mongoose.isValidObjectId(id));
    const course = await Course.create({
      title: title.trim(),
      description: description ?? "",
      facultyIds: validFaculty,
      createdBy: req.user.id,
      durationHours: Number(durationHours) || 0,
      level: level || "beginner",
      coverImage: coverImage || undefined,
      materials: [],
    });
    const populated = await Course.findById(course._id).populate(
      "facultyIds",
      "name email",
    );
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid course id" });
    }
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!canEditCourse(req.user.id, req.user.role, course)) {
      return res.status(403).json({ error: "You cannot edit this course" });
    }

    const {
      title,
      description,
      facultyIds,
      durationHours,
      level,
      coverImage,
    } = req.body;

    if (title !== undefined) course.title = title.trim();
    if (description !== undefined) course.description = description;
    if (durationHours !== undefined) course.durationHours = Number(durationHours) || 0;
    if (level !== undefined && ["beginner", "intermediate", "advanced"].includes(level)) {
      course.level = level;
    }
    if (coverImage !== undefined) course.coverImage = coverImage;

    if (facultyIds !== undefined && req.user.role === "admin") {
      let f = facultyIds;
      if (typeof f === "string") {
        try {
          f = JSON.parse(f);
        } catch {
          f = [];
        }
      }
      if (Array.isArray(f)) {
        course.facultyIds = f.filter((x) => mongoose.isValidObjectId(x));
      }
    }

    await course.save();
    const populated = await Course.findById(course._id).populate(
      "facultyIds",
      "name email department",
    );
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

export const addMaterialLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid course id" });
    }
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!canEditCourse(req.user.id, req.user.role, course)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { title, type, url, description } = req.body;
    if (!title?.trim() || !url?.trim()) {
      return res.status(400).json({ error: "title and url required" });
    }
    const t = type || "link";
    if (!["document", "video", "presentation", "link"].includes(t)) {
      return res.status(400).json({ error: "Invalid material type" });
    }
    course.materials.push({
      title: title.trim(),
      type: t,
      url: url.trim(),
      description: description || "",
    });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

export const addMaterialUpload = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid course id" });
    }
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!canEditCourse(req.user.id, req.user.role, course)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "File required" });
    }
    const { title, type } = req.body;
    const matType = type || "document";
    if (!["document", "video", "presentation"].includes(matType)) {
      return res.status(400).json({ error: "Invalid type for upload" });
    }
    const publicUrl = `/uploads/${req.file.filename}`;
    course.materials.push({
      title: (title || req.file.originalname).trim(),
      type: matType,
      url: publicUrl,
    });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

export const removeMaterial = async (req, res, next) => {
  try {
    const { id, materialId } = req.params;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(materialId)) {
      return res.status(400).json({ error: "Invalid id" });
    }
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!canEditCourse(req.user.id, req.user.role, course)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    course.materials = course.materials.filter(
      (m) => String(m._id) !== materialId,
    );
    await course.save();
    res.json(course);
  } catch (err) {
    next(err);
  }
};
