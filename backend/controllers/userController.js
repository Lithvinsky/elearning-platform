import mongoose from "mongoose";
import User from "../models/User.js";

export const listUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role && ["admin", "faculty", "learner"].includes(role)) {
      filter.role = role;
    }
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};
