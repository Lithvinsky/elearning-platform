import { Enrollment } from "../models/Enrollment.js";
import { Feedback } from "../models/Feedback.js";

/**
 * Lightweight badges derived from enrollments and feedback (no separate achievements collection).
 */
export async function getAchievementBadges(userId) {
  const [enrollmentCount, feedbackCount, completedCount] = await Promise.all([
    Enrollment.countDocuments({ learnerId: userId }),
    Feedback.countDocuments({ learnerId: userId }),
    Enrollment.countDocuments({
      learnerId: userId,
      $or: [{ progressPercent: { $gte: 100 } }, { completedAt: { $ne: null } }],
    }),
  ]);

  const badges = [];

  if (enrollmentCount >= 1) {
    badges.push({
      id: "first-course",
      title: "First steps",
      description: "Joined at least one course",
    });
  }
  if (enrollmentCount >= 3) {
    badges.push({
      id: "committed-learner",
      title: "Committed learner",
      description: "Enrolled in three or more courses",
    });
  }
  if (feedbackCount >= 1) {
    badges.push({
      id: "voice-heard",
      title: "Voice heard",
      description: "Shared feedback on a course",
    });
  }
  if (completedCount >= 1) {
    badges.push({
      id: "finisher",
      title: "Course finisher",
      description: "Marked complete on at least one course",
    });
  }

  return badges;
}
