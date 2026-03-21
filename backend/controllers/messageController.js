import mongoose from "mongoose";
import Message from "../models/Message.js";
import { loadCourse, canAccessGroupChat } from "../utils/courseAccess.js";

export const listMessages = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ error: "Invalid course id" });
    }
    const course = await loadCourse(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    const ok = await canAccessGroupChat(req.user.id, req.user.role, course);
    if (!ok) {
      return res
        .status(403)
        .json({ error: "Join the course (approved) or be faculty to view chat" });
    }
    const messages = await Message.find({ courseId })
      .populate("senderId", "name email role")
      .sort({ createdAt: 1 })
      .limit(200);
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

export const postMessage = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ error: "Invalid course id" });
    }
    const course = await loadCourse(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    const ok = await canAccessGroupChat(req.user.id, req.user.role, course);
    if (!ok) {
      return res.status(403).json({ error: "No access to this course chat" });
    }
    const { body } = req.body;
    if (!body?.trim()) {
      return res.status(400).json({ error: "Message body required" });
    }
    const msg = await Message.create({
      courseId,
      senderId: req.user.id,
      body: body.trim().slice(0, 2000),
    });
    const populated = await Message.findById(msg._id).populate(
      "senderId",
      "name email role",
    );
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};
