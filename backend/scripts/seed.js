import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Course from "../models/Course.js";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI missing");
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected");

  await Course.deleteMany({});
  await User.deleteMany({});

  const hash = await bcrypt.hash("password123", 10);

  const [admin, faculty1, faculty2] = await User.insertMany([
    {
      name: "System Admin",
      email: "admin@lms.edu",
      password: hash,
      role: "admin",
    },
    {
      name: "Dr. Sarah Chen",
      email: "sarah@lms.edu",
      password: hash,
      role: "faculty",
      department: "Computer Science",
    },
    {
      name: "Prof. James Miller",
      email: "james@lms.edu",
      password: hash,
      role: "faculty",
      department: "Data Science",
    },
  ]);

  const learner = await User.create({
    name: "Alex Student",
    email: "learner@lms.edu",
    password: hash,
    role: "learner",
  });

  const c1 = await Course.create({
    title: "Full-Stack Web Development",
    description:
      "MERN stack, REST APIs, authentication, and deployment. Includes video walkthroughs and project briefs.",
    facultyIds: [faculty1._id],
    createdBy: admin._id,
    level: "intermediate",
    durationHours: 40,
    materials: [
      {
        title: "Course syllabus (PDF)",
        type: "link",
        url: "https://example.com/syllabus-web.pdf",
      },
      {
        title: "Intro lecture recording",
        type: "video",
        url: "https://example.com/videos/intro-web",
      },
    ],
  });

  await Course.create({
    title: "Machine Learning Fundamentals",
    description:
      "Supervised learning, evaluation metrics, and practical notebooks.",
    facultyIds: [faculty2._id],
    createdBy: admin._id,
    level: "beginner",
    durationHours: 24,
    materials: [
      {
        title: "Week 1 slides",
        type: "presentation",
        url: "https://example.com/slides/ml-week1",
      },
    ],
  });

  console.log("\nSeed complete.\n");
  console.log("Admin:     admin@lms.edu / password123");
  console.log("Faculty:   sarah@lms.edu / password123  |  james@lms.edu / password123");
  console.log("Learner:   learner@lms.edu / password123");
  console.log("\nCourses:", c1.title, "+ 1 more");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
