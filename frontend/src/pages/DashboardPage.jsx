import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/ui/Card";
import { HeroIllustration } from "../components/HeroIllustration";
import { listCourses } from "../api/services/courseService";
import { myEnrollments } from "../api/services/enrollmentService";
import { useAuth } from "../hooks/useAuth";
import { getRecentCourses, pruneRecentToPublishedCourseIds } from "../utils/recentCourses";

export function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [recent, setRecent] = useState(() => getRecentCourses());

  const coursesQuery = useQuery({ queryKey: ["courses"], queryFn: listCourses });
  const enrollmentsQuery = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: myEnrollments,
    enabled: user?.role === "learner",
  });

  useEffect(() => {
    setRecent(getRecentCourses());
  }, [location.pathname, location.key]);

  useEffect(() => {
    if (user?.role !== "learner") return;
    if (!coursesQuery.data || coursesQuery.isError) return;
    pruneRecentToPublishedCourseIds(coursesQuery.data.map((c) => c._id));
    setRecent(getRecentCourses());
  }, [coursesQuery.data, coursesQuery.isError, user?.role]);

  const recentShown = useMemo(() => {
    if (user?.role === "admin") return [];
    const data = coursesQuery.data;
    if (user?.role === "learner" && data && !coursesQuery.isError) {
      const publishedIds = new Set(data.map((c) => String(c._id)));
      return recent.filter((r) => publishedIds.has(String(r.id)));
    }
    return recent;
  }, [recent, coursesQuery.data, coursesQuery.isError, user?.role]);

  const courseCount = coursesQuery.data?.length ?? 0;
  const enrollmentCount = enrollmentsQuery.data?.length ?? 0;

  const roleHint =
    user?.role === "admin"
      ? "Manage users, review enrollment requests, and publish courses."
      : user?.role === "faculty"
        ? "Teach courses, review requests, and stay connected with learners."
        : "Browse courses, track progress, and join group discussions.";

  const nextStep =
    user?.role === "learner"
      ? "Pick up where you left off or explore something new in the catalog."
      : user?.role === "faculty"
        ? "Review pending enrollment requests so learners can access your materials."
        : "Invite faculty, moderate users, and keep the catalog up to date.";

  return (
    <div className="dashboard-page">
      <section className="hero-panel hero-panel--split">
        <div className="hero-panel-copy">
          <p className="hero-kicker">Dashboard</p>
          <h1 className="hero-title">
            Welcome back, <span className="hero-name">{user?.name}</span>
          </h1>
          <p className="hero-lead">{roleHint}</p>
          <p className="hero-sub">{nextStep}</p>
          <div className="hero-actions">
            <Link to="/courses" className="btn btn-primary">
              Browse courses
            </Link>
            <Link to="/profile" className="btn btn-ghost">
              Your profile
            </Link>
            {(user?.role === "admin" || user?.role === "faculty") ? (
              <Link to="/admin/requests" className="btn btn-secondary">
                Enrollment requests
              </Link>
            ) : null}
            {user?.role === "admin" ? (
              <Link to="/admin/users" className="btn btn-secondary">
                Users
              </Link>
            ) : null}
          </div>
        </div>
        <HeroIllustration className="hero-panel-art" />
      </section>

      {recentShown.length > 0 && user?.role !== "admin" ? (
        <Card className="recent-card" title="Continue learning">
          <p className="meta-line section-sub">Courses you opened recently on this device.</p>
          <ul className="recent-pills">
            {recentShown.map((r) => (
              <li key={r.id}>
                <Link to={`/courses/${r.id}`} className="recent-pill">
                  <span className="recent-pill-title">{r.title}</span>
                  <span className="recent-pill-arrow" aria-hidden>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="stat-grid">
        <Card className="stat-card" title="Published courses">
          <p className="stat-value">{coursesQuery.isLoading ? "—" : courseCount}</p>
          <p className="stat-label">Open for enrollment</p>
        </Card>
        {user?.role === "learner" ? (
          <Card className="stat-card stat-card--accent" title="My enrollments">
            <p className="stat-value">
              {enrollmentsQuery.isLoading ? "—" : enrollmentCount}
            </p>
            <p className="stat-label">Courses you’re taking</p>
          </Card>
        ) : (
          <Card className="stat-card stat-card--muted" title="Your role">
            <p className="stat-role">{user?.role}</p>
            <p className="stat-label">Permissions on this workspace</p>
          </Card>
        )}
        <Card className="stat-card stat-card--tip" title="Shortcuts">
          <ul className="shortcut-list">
            <li>
              <Link to="/courses">Course catalog</Link>
            </li>
            <li>
              <Link to="/profile">Profile & achievements</Link>
            </li>
            {(user?.role === "admin" || user?.role === "faculty") ? (
              <li>
                <Link to="/admin/requests">Enrollment queue</Link>
              </li>
            ) : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
