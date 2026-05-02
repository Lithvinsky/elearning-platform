import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { LevelBadge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { listCourses } from "../api/services/courseService";
import {
  listEnrollmentRequestsForUser,
  myEnrollments,
  requestEnrollment,
} from "../api/services/enrollmentService";
import { useAuth } from "../hooks/useAuth";

/** @param {string} courseId */
function courseKey(courseId) {
  return String(courseId ?? "");
}

/**
 * @param {string} courseId
 * @param {Map<string, unknown>} enrollmentByCourseId
 * @param {Map<string, { status?: string }>} requestByCourseId
 */
function learnerCourseAccessStatus(courseId, enrollmentByCourseId, requestByCourseId) {
  const key = courseKey(courseId);
  if (enrollmentByCourseId.has(key)) return "enrolled";
  const req = requestByCourseId.get(key);
  if (req?.status === "pending") return "pending";
  if (req?.status === "rejected") return "rejected";
  return "none";
}

const SORT_OPTIONS = [
  { value: "title-asc", label: "Title A–Z" },
  { value: "title-desc", label: "Title Z–A" },
  { value: "duration-asc", label: "Duration (shortest)" },
  { value: "duration-desc", label: "Duration (longest)" },
];

export function CoursesPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("title-asc");

  const coursesQuery = useQuery({ queryKey: ["courses"], queryFn: listCourses });

  const enrollmentsQuery = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: myEnrollments,
    enabled: user?.role === "learner",
  });

  const accessRequestsQuery = useQuery({
    queryKey: ["enrollment-requests", user?._id],
    queryFn: () => listEnrollmentRequestsForUser(user._id),
    enabled: user?.role === "learner" && Boolean(user?._id),
  });

  const enrollmentByCourseId = useMemo(() => {
    const m = new Map();
    const rows = enrollmentsQuery.data || [];
    for (const row of rows) {
      const cid = row.courseId?._id ?? row.courseId;
      if (cid) m.set(courseKey(cid), row);
    }
    return m;
  }, [enrollmentsQuery.data]);

  const requestByCourseId = useMemo(() => {
    const m = new Map();
    const rows = accessRequestsQuery.data || [];
    for (const row of rows) {
      const cid = row.courseId?._id ?? row.courseId;
      if (cid) m.set(courseKey(cid), row);
    }
    return m;
  }, [accessRequestsQuery.data]);

  const learnerAccessLoading =
    user?.role === "learner" &&
    (enrollmentsQuery.isLoading || accessRequestsQuery.isLoading);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  const requestMut = useMutation({
    mutationFn: (courseId) => requestEnrollment({ courseId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-enrollments"] });
      if (user?._id) {
        qc.invalidateQueries({ queryKey: ["enrollment-requests", user._id] });
      }
      setNotice({ type: "success", text: "Access request sent. Faculty or admin will review it soon." });
    },
    onError: (err) => {
      const text =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        "Could not send request.";
      setNotice({ type: "error", text });
    },
  });

  const canCreate = user?.role === "admin" || user?.role === "faculty";
  const rawCourses = coursesQuery.data || [];

  const displayCourses = useMemo(() => {
    let list = [...rawCourses];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          (c.title || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q) ||
          (c.category || "").toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      switch (sort) {
        case "title-desc":
          return (b.title || "").localeCompare(a.title || "", undefined, { sensitivity: "base" });
        case "duration-asc":
          return (a.durationHours || 0) - (b.durationHours || 0);
        case "duration-desc":
          return (b.durationHours || 0) - (a.durationHours || 0);
        case "title-asc":
        default:
          return (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" });
      }
    });
    return list;
  }, [rawCourses, search, sort]);

  const total = rawCourses.length;
  const shown = displayCourses.length;

  return (
    <Card
      title="Course catalog"
      action={
        canCreate ? (
          <Link to="/courses/new" className="btn btn-primary">
            Add course
          </Link>
        ) : null
      }
    >
      <p className="page-intro">
        Explore published courses. Learners can request access; faculty and admins approve enrollments.
      </p>

      {notice ? (
        <div
          className={notice.type === "success" ? "notice notice-success" : "notice notice-error"}
          role="status"
        >
          <span>{notice.text}</span>
          <button
            type="button"
            className="notice-dismiss"
            onClick={() => setNotice(null)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ) : null}

      {!coursesQuery.isLoading && !coursesQuery.isError && total > 0 ? (
        <div className="catalog-toolbar">
          <label className="catalog-search">
            <span className="sr-only">Search courses</span>
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, topic, or category…"
              autoComplete="off"
              className="catalog-search-input"
            />
          </label>
          <label className="catalog-sort">
            <span className="catalog-sort-label">Sort</span>
            <select className="input catalog-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <p className="catalog-count meta-line" aria-live="polite">
            Showing {shown} of {total}
            {search.trim() ? (
              <>
                {" "}
                <button type="button" className="link-button" onClick={() => setSearch("")}>
                  Clear search
                </button>
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      {coursesQuery.isLoading ? (
        <div className="course-skeleton-list" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <div key={i} className="list-item skeleton-course-row">
              <Skeleton className="skeleton-shorter" />
              <Skeleton lines={2} />
              <div className="skeleton-actions">
                <Skeleton className="skeleton-btn" />
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {coursesQuery.isError ? (
        <p className="error">Could not load courses. Check your connection and try again.</p>
      ) : null}

      {!coursesQuery.isLoading && !coursesQuery.isError ? (
        <>
          {displayCourses.length > 0 ? (
            <div className="list course-list">
              {displayCourses.map((course) => {
                const accessStatus =
                  user?.role === "learner" && !learnerAccessLoading
                    ? learnerCourseAccessStatus(
                        course._id,
                        enrollmentByCourseId,
                        requestByCourseId,
                      )
                    : null;

                return (
                  <article key={course._id} className="list-item course-card">
                    <div className="course-card-main">
                      <div className="course-card-head">
                        <h4 className="course-title">{course.title}</h4>
                        <LevelBadge level={course.level || "beginner"} />
                      </div>
                      <p className="course-desc">{course.description}</p>
                      <p className="meta-line course-meta">
                        {course.durationHours || 0} hours
                        {course.category ? ` · ${course.category}` : ""}
                      </p>
                    </div>
                    <div className="course-card-actions row">
                      {user?.role === "learner" ? (
                        learnerAccessLoading ? (
                          <>
                            <Link to={`/courses/${course._id}`} className="btn btn-secondary btn-sm">
                              View course
                            </Link>
                            <span className="course-access-loading meta-line">Loading access…</span>
                          </>
                        ) : accessStatus === "enrolled" ? (
                          <Link to={`/courses/${course._id}`} className="btn btn-primary btn-sm">
                            Open course
                          </Link>
                        ) : (
                          <>
                            <Link to={`/courses/${course._id}`} className="btn btn-secondary btn-sm">
                              View course
                            </Link>
                            {accessStatus === "pending" ? (
                              <span className="course-access-status course-access-status--pending">
                                Pending approval
                              </span>
                            ) : null}
                            {accessStatus === "rejected" ? (
                              <Button
                                variant="ghost"
                                className="btn-sm"
                                onClick={() => requestMut.mutate(course._id)}
                                disabled={requestMut.isPending}
                              >
                                {requestMut.isPending ? "Sending…" : "Request again"}
                              </Button>
                            ) : null}
                            {accessStatus === "none" ? (
                              <Button
                                variant="ghost"
                                className="btn-sm"
                                onClick={() => requestMut.mutate(course._id)}
                                disabled={requestMut.isPending}
                              >
                                {requestMut.isPending ? "Sending…" : "Request access"}
                              </Button>
                            ) : null}
                          </>
                        )
                      ) : (
                        <Link to={`/courses/${course._id}`} className="btn btn-secondary btn-sm">
                          View course
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : total > 0 ? (
            <div className="empty-panel empty-panel--compact">
              <p className="empty-title">No matches</p>
              <p className="meta-line">Try a different search term or clear the filter.</p>
              <button type="button" className="btn btn-secondary empty-cta" onClick={() => setSearch("")}>
                Clear search
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {!coursesQuery.isLoading && !coursesQuery.isError && total === 0 ? (
        <div className="empty-panel">
          <p className="empty-title">No courses yet</p>
          <p className="meta-line">
            {canCreate
              ? "Create your first course to get started."
              : "Check back later — instructors are preparing content."}
          </p>
          {canCreate ? (
            <Link to="/courses/new" className="btn btn-primary empty-cta">
              Create a course
            </Link>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
