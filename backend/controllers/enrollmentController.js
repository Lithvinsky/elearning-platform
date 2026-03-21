import mongoose from "mongoose";
import EnrollmentRequest from "../models/EnrollmentRequest.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import { isAssignedFaculty, isAdmin } from "../utils/courseAccess.js";

export const requestAccess = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ error: "Invalid course id" });
    }
    if (req.user.role !== "learner") {
      return res.status(403).json({ error: "Only learners can request access" });
    }
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const existingEnroll = await Enrollment.findOne({
      learnerId: req.user.id,
      courseId,
    });
    if (existingEnroll) {
      return res.status(400).json({ error: "You are already enrolled" });
    }

    const doc = await EnrollmentRequest.findOne({
      learnerId: req.user.id,
      courseId,
    });
    if (doc) {
      if (doc.status === "pending") {
        return res.status(400).json({ error: "Request already pending" });
      }
      if (doc.status === "approved") {
        return res.status(400).json({ error: "Already approved — refresh enrollments" });
      }
    }

    const request = await EnrollmentRequest.findOneAndUpdate(
      { learnerId: req.user.id, courseId },
      {
        $set: {
          status: "pending",
          message: req.body.message || "",
        },
      },
      { upsert: true, new: true },
    ).populate("learnerId", "name email").populate("courseId", "title");

    res.status(201).json(request);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Duplicate request" });
    }
    next(err);
  }
};

export const listEnrollmentRequests = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    let filter = {};

    if (role === "admin") {
      filter = {};
    } else if (role === "faculty") {
      const courses = await Course.find({ facultyIds: userId }).select("_id");
      const ids = courses.map((c) => c._id);
      filter.courseId = { $in: ids };
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }

    const requests = await EnrollmentRequest.find(filter)
      .populate("learnerId", "name email department phone")
      .populate("courseId", "title")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

export const updateEnrollmentRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "status must be approved or rejected" });
    }
    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const request = await EnrollmentRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: "Request not found" });

    const course = await Course.findById(request.courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    const uid = req.user.id;
    const role = req.user.role;

    if (!isAdmin(role)) {
      if (role !== "faculty" || !isAssignedFaculty(uid, course)) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    request.status = status;
    await request.save();

    if (status === "approved") {
      await Enrollment.findOneAndUpdate(
        { learnerId: request.learnerId, courseId: request.courseId },
        { $setOnInsert: { progressPercent: 0 } },
        { upsert: true, new: true },
      );
    }

    const populated = await EnrollmentRequest.findById(request._id)
      .populate("learnerId", "name email")
      .populate("courseId", "title");
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

export const myEnrollments = async (req, res, next) => {
  try {
    if (req.user.role !== "learner") {
      return res.status(403).json({ error: "Learners only" });
    }
    const list = await Enrollment.find({ learnerId: req.user.id })
      .populate("courseId")
      .sort({ updatedAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { progressPercent } = req.body;
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ error: "Invalid course id" });
    }
    if (req.user.role !== "learner") {
      return res.status(403).json({ error: "Learners only" });
    }
    const p = Math.min(100, Math.max(0, Number(progressPercent) || 0));
    const en = await Enrollment.findOneAndUpdate(
      { learnerId: req.user.id, courseId },
      { progressPercent: p },
      { new: true },
    ).populate("courseId", "title");
    if (!en) return res.status(404).json({ error: "Not enrolled" });
    res.json(en);
  } catch (err) {
    next(err);
  }
};
