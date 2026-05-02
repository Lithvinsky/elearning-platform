import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { assertEnv, env } from "../src/config/env.js";
import { User } from "../src/models/User.js";
import { Course } from "../src/models/Course.js";
import { Enrollment } from "../src/models/Enrollment.js";
import { EnrollmentRequest } from "../src/models/EnrollmentRequest.js";
import { Feedback } from "../src/models/Feedback.js";
import { Message } from "../src/models/Message.js";

const mkMaterial = (title, type, url) => ({ title, type, url });

async function seed() {
  assertEnv();
  await mongoose.connect(env.mongoUri);
  console.log("Connected");

  await Message.deleteMany({});
  await Feedback.deleteMany({});
  await EnrollmentRequest.deleteMany({});
  await Enrollment.deleteMany({});
  await Course.deleteMany({});
  await User.deleteMany({});

  const hash = await bcrypt.hash("password123", 10);

  const [admin, faculty1, faculty2] = await User.insertMany([
    {
      name: "System Admin",
      email: "admin@lms.edu",
      passwordHash: hash,
      role: "admin",
    },
    {
      name: "Dr. Sarah Chen",
      email: "sarah@lms.edu",
      passwordHash: hash,
      role: "faculty",
      department: "Computer Science",
    },
    {
      name: "Prof. James Miller",
      email: "james@lms.edu",
      passwordHash: hash,
      role: "faculty",
      department: "Data Science",
    },
  ]);

  const learnerSpecs = [
    { name: "Alex Student", email: "learner@lms.edu" },
    { name: "Maria Vasquez", email: "maria@lms.edu" },
    { name: "Sam Okonkwo", email: "sam@lms.edu" },
    { name: "Jordan Lee", email: "jordan@lms.edu" },
    { name: "Priya Sharma", email: "priya@lms.edu" },
    { name: "Chris Patel", email: "chris@lms.edu" },
    { name: "Taylor Brooks", email: "taylor@lms.edu" },
  ];

  const learners = await User.insertMany(
    learnerSpecs.map((s) => ({
      ...s,
      passwordHash: hash,
      role: "learner",
    })),
  );

  const byEmail = Object.fromEntries(learners.map((u) => [u.email, u]));

  const coursePayloads = [
    {
      title: "Full-Stack Web Development",
      description:
        "MERN stack, REST APIs, authentication, and deployment. Includes video walkthroughs and project briefs.",
      category: "Web",
      level: "intermediate",
      durationHours: 40,
      faculty: faculty1,
      materials: [
        mkMaterial("Course syllabus (PDF)", "link", "https://example.com/syllabus-web.pdf"),
        mkMaterial("Intro lecture recording", "video", "https://example.com/videos/intro-web"),
        mkMaterial("Auth deep-dive slides", "presentation", "https://example.com/slides/auth"),
      ],
    },
    {
      title: "Machine Learning Fundamentals",
      description:
        "Supervised learning, evaluation metrics, and practical notebooks with real datasets.",
      category: "Data",
      level: "beginner",
      durationHours: 24,
      faculty: faculty2,
      materials: [
        mkMaterial("Week 1 slides", "presentation", "https://example.com/slides/ml-week1"),
        mkMaterial("Lab notebook template", "document", "https://example.com/labs/ml-lab1"),
      ],
    },
    {
      title: "UX Research & Prototyping",
      description:
        "User interviews, journey maps, and high-fidelity prototypes in Figma. Capstone usability study.",
      category: "Design",
      level: "beginner",
      durationHours: 18,
      faculty: faculty1,
      materials: [
        mkMaterial("Design systems reading list", "link", "https://example.com/ux-readings"),
        mkMaterial("Figma starter kit", "link", "https://example.com/figma-kit"),
      ],
    },
    {
      title: "Cloud Architecture on AWS",
      description:
        "VPCs, IAM, serverless with Lambda, RDS, and cost-aware design patterns for production apps.",
      category: "Cloud",
      level: "advanced",
      durationHours: 32,
      faculty: faculty2,
      materials: [
        mkMaterial("Architecture patterns PDF", "document", "https://example.com/aws-arch.pdf"),
        mkMaterial("Hands-on lab index", "link", "https://example.com/aws-labs"),
        mkMaterial("Well-Architected overview", "video", "https://example.com/videos/well-arch"),
      ],
    },
    {
      title: "Introduction to Cybersecurity",
      description:
        "Threat models, cryptography basics, OWASP Top 10, and secure coding habits for developers.",
      category: "Security",
      level: "beginner",
      durationHours: 20,
      faculty: faculty1,
      materials: [
        mkMaterial("Threat modeling worksheet", "document", "https://example.com/sec-threat.pdf"),
        mkMaterial("OWASP lecture", "video", "https://example.com/videos/owasp"),
      ],
    },
    {
      title: "DevOps & CI/CD Pipelines",
      description:
        "Containers, GitHub Actions, observability, and zero-downtime releases for web services.",
      category: "DevOps",
      level: "intermediate",
      durationHours: 28,
      faculty: faculty2,
      materials: [
        mkMaterial("Docker cheat sheet", "document", "https://example.com/docker-cheatsheet"),
        mkMaterial("CI pipeline examples", "link", "https://example.com/ci-examples"),
      ],
    },
    {
      title: "Database Design & SQL",
      description:
        "Normalization, indexing, transactions, and query tuning with PostgreSQL exercises.",
      category: "Data",
      level: "intermediate",
      durationHours: 22,
      faculty: faculty1,
      materials: [
        mkMaterial("ER modeling slides", "presentation", "https://example.com/slides/er-sql"),
        mkMaterial("SQL practice dataset", "link", "https://example.com/datasets/employees"),
      ],
    },
    {
      title: "Mobile Apps with React Native",
      description:
        "Cross-platform UI, navigation, offline caches, and publishing to app stores.",
      category: "Mobile",
      level: "intermediate",
      durationHours: 36,
      faculty: faculty1,
      materials: [
        mkMaterial("RN setup guide", "document", "https://example.com/rn-setup"),
        mkMaterial("Navigation patterns", "video", "https://example.com/videos/rn-nav"),
      ],
    },
    {
      title: "Technical Writing for Engineers",
      description:
        "Clear specs, API docs, RFCs, and reader-focused structure for engineering audiences.",
      category: "Communication",
      level: "beginner",
      durationHours: 12,
      faculty: faculty2,
      materials: [
        mkMaterial("Style guide (Google-derived)", "link", "https://example.com/tw-style"),
        mkMaterial("Spec template", "document", "https://example.com/spec-template.docx"),
      ],
    },
    {
      title: "Data Visualization with D3",
      description:
        "Scales, selections, joins, and interactive dashboards for exploratory analytics.",
      category: "Data",
      level: "advanced",
      durationHours: 26,
      faculty: faculty2,
      materials: [
        mkMaterial("D3 gallery walkthrough", "video", "https://example.com/videos/d3-gallery"),
        mkMaterial("Observable notebooks index", "link", "https://example.com/observable-index"),
      ],
    },
  ];

  const courses = await Course.insertMany(
    coursePayloads.map((c) => {
      const { faculty, materials, ...rest } = c;
      return {
        ...rest,
        facultyIds: [faculty._id],
        createdBy: admin._id,
        materials,
      };
    }),
  );

  /** @type {{ learnerEmail: string, courseIndex: number, progressPercent?: number }[]} */
  const enrollmentSpecs = [
    { learnerEmail: "learner@lms.edu", courseIndex: 0, progressPercent: 45 },
    { learnerEmail: "learner@lms.edu", courseIndex: 1, progressPercent: 80 },
    { learnerEmail: "learner@lms.edu", courseIndex: 4, progressPercent: 20 },
    { learnerEmail: "maria@lms.edu", courseIndex: 0, progressPercent: 90 },
    { learnerEmail: "maria@lms.edu", courseIndex: 2, progressPercent: 55 },
    { learnerEmail: "maria@lms.edu", courseIndex: 5, progressPercent: 30 },
    { learnerEmail: "sam@lms.edu", courseIndex: 1, progressPercent: 100 },
    { learnerEmail: "sam@lms.edu", courseIndex: 3, progressPercent: 40 },
    { learnerEmail: "sam@lms.edu", courseIndex: 7, progressPercent: 15 },
    { learnerEmail: "jordan@lms.edu", courseIndex: 2, progressPercent: 70 },
    { learnerEmail: "jordan@lms.edu", courseIndex: 6, progressPercent: 35 },
    { learnerEmail: "jordan@lms.edu", courseIndex: 9, progressPercent: 25 },
    { learnerEmail: "priya@lms.edu", courseIndex: 3, progressPercent: 60 },
    { learnerEmail: "priya@lms.edu", courseIndex: 4, progressPercent: 50 },
    { learnerEmail: "priya@lms.edu", courseIndex: 8, progressPercent: 95 },
    { learnerEmail: "chris@lms.edu", courseIndex: 5, progressPercent: 22 },
    { learnerEmail: "chris@lms.edu", courseIndex: 7, progressPercent: 48 },
    { learnerEmail: "chris@lms.edu", courseIndex: 0, progressPercent: 12 },
    { learnerEmail: "taylor@lms.edu", courseIndex: 8, progressPercent: 88 },
    { learnerEmail: "taylor@lms.edu", courseIndex: 9, progressPercent: 42 },
    { learnerEmail: "taylor@lms.edu", courseIndex: 4, progressPercent: 33 },
  ];

  await Enrollment.insertMany(
    enrollmentSpecs.map((s) => ({
      learnerId: byEmail[s.learnerEmail]._id,
      courseId: courses[s.courseIndex]._id,
      progressPercent: s.progressPercent ?? 0,
    })),
  );

  const reviewedPast = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  await EnrollmentRequest.insertMany([
    {
      learnerId: byEmail["taylor@lms.edu"]._id,
      courseId: courses[1]._id,
      status: "pending",
      note: "Need this for my capstone project.",
    },
    {
      learnerId: byEmail["jordan@lms.edu"]._id,
      courseId: courses[4]._id,
      status: "pending",
      note: "",
    },
    {
      learnerId: byEmail["chris@lms.edu"]._id,
      courseId: courses[2]._id,
      status: "rejected",
      note: "Interested if a seat opens",
      reviewedBy: admin._id,
      reviewedAt: reviewedPast,
    },
  ]);

  /** @type {{ learnerEmail: string, courseIndex: number, rating: number, comment?: string }[]} */
  const feedbackSpecs = [
    { learnerEmail: "learner@lms.edu", courseIndex: 0, rating: 5, comment: "Projects were challenging but fair. TAs responded quickly." },
    { learnerEmail: "learner@lms.edu", courseIndex: 1, rating: 4, comment: "Great intro—would love more deep learning at the end." },
    { learnerEmail: "learner@lms.edu", courseIndex: 4, rating: 5, comment: "" },
    { learnerEmail: "maria@lms.edu", courseIndex: 0, rating: 5, comment: "Best structured web course I've taken." },
    { learnerEmail: "maria@lms.edu", courseIndex: 2, rating: 4, comment: "Figma sections were gold; interviews unit felt rushed." },
    { learnerEmail: "maria@lms.edu", courseIndex: 5, rating: 4, comment: "" },
    { learnerEmail: "sam@lms.edu", courseIndex: 1, rating: 5, comment: "Notebooks were clear. Finals aligned with labs." },
    { learnerEmail: "sam@lms.edu", courseIndex: 3, rating: 4, comment: "Labs are demanding—budget weekend time." },
    { learnerEmail: "sam@lms.edu", courseIndex: 7, rating: 3, comment: "Good content; emulator setup was fiddly on Windows." },
    { learnerEmail: "jordan@lms.edu", courseIndex: 2, rating: 5, comment: "" },
    { learnerEmail: "jordan@lms.edu", courseIndex: 6, rating: 4, comment: "Indexes lecture saved my group project." },
    { learnerEmail: "jordan@lms.edu", courseIndex: 9, rating: 5, comment: "D3 clicked after week 3—worth sticking with." },
    { learnerEmail: "priya@lms.edu", courseIndex: 3, rating: 5, comment: "Exactly what I needed before our AWS migration." },
    { learnerEmail: "priya@lms.edu", courseIndex: 4, rating: 4, comment: "" },
    { learnerEmail: "priya@lms.edu", courseIndex: 8, rating: 5, comment: "Templates alone paid for the course." },
    { learnerEmail: "chris@lms.edu", courseIndex: 5, rating: 4, comment: "GH Actions modules were practical." },
    { learnerEmail: "chris@lms.edu", courseIndex: 7, rating: 4, comment: "" },
    { learnerEmail: "chris@lms.edu", courseIndex: 0, rating: 3, comment: "Jumped in mid-term—catch-up was tough." },
    { learnerEmail: "taylor@lms.edu", courseIndex: 8, rating: 5, comment: "" },
    { learnerEmail: "taylor@lms.edu", courseIndex: 9, rating: 4, comment: "Advanced but well paced." },
    { learnerEmail: "taylor@lms.edu", courseIndex: 4, rating: 4, comment: "More labs would help beginners." },
  ];

  await Feedback.insertMany(
    feedbackSpecs.map((f) => ({
      learnerId: byEmail[f.learnerEmail]._id,
      courseId: courses[f.courseIndex]._id,
      rating: f.rating,
      comment: f.comment ?? "",
    })),
  );

  const msg = (courseIndex, sender, content, minutesAgo) => ({
    courseId: courses[courseIndex]._id,
    senderId: sender._id,
    content,
    createdAt: new Date(Date.now() - minutesAgo * 60 * 1000),
    updatedAt: new Date(Date.now() - minutesAgo * 60 * 1000),
  });

  const messageDocs = [
    msg(0, faculty1, "Welcome everyone—post questions here before Thursday’s workshop.", 7200),
    msg(0, byEmail["learner@lms.edu"], "Are we using JWT or sessions for the auth project?", 7000),
    msg(0, faculty1, "JWT for the API project; sessions optional stretch goal.", 6980),
    msg(0, byEmail["maria@lms.edu"], "Office hours moved to room 204 tomorrow.", 6500),
    msg(1, faculty2, "Dataset for homework 2 is under Materials → Lab notebook template.", 9000),
    msg(1, byEmail["sam@lms.edu"], "Can we use sklearn pipelines for the midterm?", 8800),
    msg(1, faculty2, "Yes—pipelines encouraged if you explain assumptions.", 8790),
    msg(1, byEmail["learner@lms.edu"], "Metric cheat sheet from lecture was super helpful.", 8600),
    msg(2, faculty1, "Bring rough prototypes to studio—we’ll pair for critique.", 5000),
    msg(2, byEmail["jordan@lms.edu"], "Sharing my FigJam link in the thread below.", 4800),
    msg(3, faculty2, "Reminder: tear down sandbox resources after labs to avoid surprise bills.", 3000),
    msg(3, byEmail["priya@lms.edu"], "VPC peering lab—anyone hit the route table bug?", 2900),
    msg(3, faculty2, "Check the troubleshooting doc I pinned last week.", 2880),
    msg(4, faculty1, "Discussion forum for OWASP Top 10—pick two items for your write-up.", 4000),
    msg(4, byEmail["priya@lms.edu"], "Going with XSS and broken access control.", 3900),
    msg(4, byEmail["taylor@lms.edu"], "Same pair—happy to compare notes.", 3850),
    msg(5, faculty2, "CI assignment: green build + artifact upload required.", 2500),
    msg(5, byEmail["chris@lms.edu"], "Secrets in GH Actions—use repo environments?", 2400),
    msg(5, faculty2, "Yes; never commit keys. Example workflow linked in week 4.", 2390),
    msg(6, faculty1, "Extra credit: optimize the slow query on the employee dataset.", 6000),
    msg(7, faculty1, "Expo SDK pinned—don’t upgrade mid-project unless you coordinate.", 1500),
    msg(7, byEmail["sam@lms.edu"], "Android build failing on M1—known issue thread?", 1400),
    msg(7, byEmail["chris@lms.edu"], "Try the RN Discord pin #752—worked for me.", 1380),
    msg(8, faculty2, "Peer review pairs posted—swap drafts by Friday.", 8000),
    msg(9, faculty2, "Observable homework: fork the starter and tag me when stuck.", 2000),
    msg(9, byEmail["jordan@lms.edu"], "Transitions lesson unlocked the homework for me.", 1950),
  ];

  await Message.insertMany(messageDocs);

  console.log("\nSeed complete.\n");
  console.log("Admin:     admin@lms.edu / password123");
  console.log(
    "Faculty:   sarah@lms.edu / password123  |  james@lms.edu / password123",
  );
  console.log("Learners:  learner@lms.edu + maria, sam, jordan, priya, chris, taylor @lms.edu / password123");
  console.log(`\nCourses: ${courses.length}`);
  console.log(`Enrollments: ${enrollmentSpecs.length}`);
  console.log(`Access requests (pending + rejected sample): 3`);
  console.log(`Feedback rows: ${feedbackSpecs.length}`);
  console.log(`Chat messages: ${messageDocs.length}`);

  await mongoose.disconnect();
  process.exit(0);
}

function printMongoAuthHint(e) {
  if (e?.code === 8000 || /bad auth|authentication failed/i.test(String(e?.message))) {
    console.error(
      "\nAtlas rejected the database user or password. Fix MONGO_URI in backend/.env:\n" +
        "  - Use the exact user + password from Atlas → Database Access (reset if unsure).\n" +
        "  - If the password has @ : / ? # [ ] etc., URL-encode it in the connection string.\n" +
        "  - Atlas → Network Access: allow your IP (or 0.0.0.0/0 for dev).\n",
    );
  }
}

seed().catch((e) => {
  console.error(e);
  printMongoAuthHint(e);
  process.exit(1);
});
