import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { LevelBadge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import {
  listEnrollmentRequests,
  reviewEnrollmentRequest,
} from "../api/services/enrollmentService";
import { useAuth } from "../hooks/useAuth";

const STATUS_FILTER = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function formatWhen(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
}

function statusLabel(s) {
  if (s === "pending") return "Pending";
  if (s === "approved") return "Approved";
  if (s === "rejected") return "Rejected";
  return s || "—";
}

export function EnrollmentRequestsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewErr, setReviewErr] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const requestsQuery = useQuery({
    queryKey: ["enrollment-requests"],
    queryFn: listEnrollmentRequests,
  });

  const reviewMut = useMutation({
    mutationFn: ({ id, status }) => reviewEnrollmentRequest(id, { status }),
    onMutate: ({ id }) => {
      setProcessingId(id);
      setReviewErr("");
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["enrollment-requests"] });
      const lid = data?.learnerId?._id ?? data?.learnerId;
      if (lid) {
        const idStr = String(lid);
        qc.invalidateQueries({ queryKey: ["enrollment-requests", idStr] });
        qc.invalidateQueries({ queryKey: ["enrollments", idStr] });
      }
    },
    onError: (err) => {
      const text =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        "Could not update the request.";
      setReviewErr(typeof text === "string" ? text : "Could not update the request.");
    },
    onSettled: () => {
      setProcessingId(null);
    },
  });

  useEffect(() => {
    if (!reviewErr) return;
    const t = setTimeout(() => setReviewErr(""), 8000);
    return () => clearTimeout(t);
  }, [reviewErr]);

  const rows = requestsQuery.data || [];

  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    for (const r of rows) {
      if (r.status === "pending") pending += 1;
      else if (r.status === "approved") approved += 1;
      else if (r.status === "rejected") rejected += 1;
    }
    return { pending, approved, rejected, total: rows.length };
  }, [rows]);

  const displayRows = useMemo(() => {
    let list = [...rows];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const name = (r.learnerId?.name || "").toLowerCase();
        const email = (r.learnerId?.email || "").toLowerCase();
        const title = (r.courseId?.title || "").toLowerCase();
        return name.includes(q) || email.includes(q) || title.includes(q);
      });
    }
    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }
    return list;
  }, [rows, search, statusFilter]);

  const intro =
    user?.role === "admin"
      ? "Review access requests for any course. Approving creates an enrollment for the learner."
      : "Review requests for courses you teach. Learners who are already enrolled or have a pending request are handled by the server.";

  return (
    <Card
      title="Enrollment requests"
      action={
        counts.pending > 0 ? (
          <span className="request-queue-pending-badge" aria-live="polite">
            {counts.pending} pending
          </span>
        ) : null
      }
    >
      <p className="page-intro">{intro}</p>

      {counts.total > 0 ? (
        <p className="request-queue-summary meta-line" aria-live="polite">
          <strong>{counts.total}</strong> total · {counts.pending} pending · {counts.approved} approved ·{" "}
          {counts.rejected} rejected
        </p>
      ) : null}

      {reviewErr ? (
        <div className="notice notice-error" role="alert">
          <span>{reviewErr}</span>
          <button type="button" className="notice-dismiss" onClick={() => setReviewErr("")} aria-label="Dismiss">
            ×
          </button>
        </div>
      ) : null}

      {!requestsQuery.isLoading && !requestsQuery.isError && counts.total > 0 ? (
        <div className="catalog-toolbar enrollment-requests-toolbar">
          <label className="catalog-search">
            <span className="sr-only">Search requests</span>
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by learner, email, or course…"
              autoComplete="off"
              className="catalog-search-input"
            />
          </label>
          <label className="catalog-sort">
            <span className="catalog-sort-label">Status</span>
            <select
              className="input catalog-sort-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_FILTER.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <p className="catalog-count meta-line" aria-live="polite">
            Showing {displayRows.length} of {counts.total}
            {search.trim() || statusFilter !== "all" ? (
              <>
                {" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </button>
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      {requestsQuery.isLoading ? (
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

      {requestsQuery.isError ? (
        <p className="error">Could not load enrollment requests. Try again later.</p>
      ) : null}

      {!requestsQuery.isLoading && !requestsQuery.isError ? (
        <>
          {counts.total === 0 ? (
            <p className="lead">
              No enrollment requests yet. When learners request access to a course you teach (or any course,
              if you are an administrator), they will appear here for approval.
            </p>
          ) : displayRows.length === 0 ? (
            <div className="empty-panel empty-panel--compact">
              <p className="empty-title">No matches</p>
              <p className="meta-line">Try another search or switch the status filter.</p>
              <button
                type="button"
                className="btn btn-secondary empty-cta"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="list enrollment-requests-list">
              {displayRows.map((row) => {
                const learner = row.learnerId;
                const course = row.courseId;
                const learnerId = learner?._id ?? row.learnerId;
                const courseId = course?._id ?? row.courseId;
                const busy = processingId === row._id && reviewMut.isPending;

                return (
                  <article key={row._id} className="list-item enrollment-request-card">
                    <div className="enrollment-request-main">
                      <div className="enrollment-request-head">
                        <span
                          className={`request-status-tag request-status-tag--${row.status || "pending"}`}
                          aria-label={`Status: ${statusLabel(row.status)}`}
                        >
                          {statusLabel(row.status)}
                        </span>
                        {course?.level ? <LevelBadge level={course.level} /> : null}
                      </div>
                      <p className="enrollment-request-title">
                        {courseId ? (
                          <Link to={`/courses/${courseId}`} className="inline-link">
                            {course?.title || "Course"}
                          </Link>
                        ) : (
                          <span>{course?.title || "Course"}</span>
                        )}
                      </p>
                      <p className="enrollment-request-learner">
                        <strong>{learner?.name || "Learner"}</strong>
                      </p>
                      {learner?.email ? (
                        <p className="meta-line enrollment-request-email">{learner.email}</p>
                      ) : null}
                      <p className="meta-line enrollment-request-dates">
                        Requested {formatWhen(row.createdAt)}
                        {row.status !== "pending" && row.reviewedAt ? (
                          <>
                            {" "}
                            · Reviewed {formatWhen(row.reviewedAt)}
                          </>
                        ) : null}
                      </p>
                      {row.note ? (
                        <p className="enrollment-request-note">
                          <span className="enrollment-request-note-label">Learner note:</span> {row.note}
                        </p>
                      ) : null}
                      {learnerId && user?.role === "admin" ? (
                        <p className="meta-line">
                          <Link to={`/profile/${learnerId}`} className="inline-link">
                            View learner profile
                          </Link>
                        </p>
                      ) : null}
                    </div>
                    {row.status === "pending" ? (
                      <div className="enrollment-request-actions row">
                        <Button
                          onClick={() => reviewMut.mutate({ id: row._id, status: "approved" })}
                          disabled={busy}
                        >
                          {busy ? "Updating…" : "Approve"}
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => reviewMut.mutate({ id: row._id, status: "rejected" })}
                          disabled={busy}
                        >
                          {busy ? "Updating…" : "Reject"}
                        </Button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : null}
    </Card>
  );
}
