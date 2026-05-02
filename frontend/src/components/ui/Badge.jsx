import clsx from "clsx";

const levelMap = {
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
};

function formatLevel(level) {
  const s = String(level || "beginner");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function LevelBadge({ level = "beginner" }) {
  const v = levelMap[level] || "beginner";
  return (
    <span className={clsx("level-badge", `level-badge--${v}`)}>{formatLevel(level)}</span>
  );
}

const roleSlug = {
  admin: "admin",
  faculty: "faculty",
  learner: "learner",
};

function formatRole(role) {
  const r = String(role || "learner");
  if (r === "faculty") return "Faculty";
  if (r === "admin") return "Admin";
  return "Learner";
}

export function RoleBadge({ role = "learner" }) {
  const slug = roleSlug[role] || "learner";
  return (
    <span className={clsx("role-badge", `role-badge--${slug}`)}>{formatRole(role)}</span>
  );
}
