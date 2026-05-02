import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  getUser,
  getUserAchievements,
  updateMyProfile,
  updateUser,
} from "../api/services/userService";
import {
  listEnrollmentRequestsForUser,
  listEnrollmentsForUser,
} from "../api/services/enrollmentService";
import { useAuth } from "../hooks/useAuth";

function formatShortDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function ProfilePage() {
  const { userId: paramUserId } = useParams();
  const qc = useQueryClient();
  const { accessToken, setSession, user: authUser } = useAuth();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [editingOther, setEditingOther] = useState(false);
  const [editingSelf, setEditingSelf] = useState(false);

  const targetId = paramUserId ?? authUser?._id;
  const canEdit =
    authUser &&
    (!paramUserId || String(paramUserId) === String(authUser._id));
  const adminViewingOther =
    authUser?.role === "admin" &&
    paramUserId &&
    String(paramUserId) !== String(authUser._id);

  const profileQuery = useQuery({
    queryKey: ["profile", targetId],
    queryFn: () => getUser(targetId),
    enabled: Boolean(authUser && targetId),
  });

  const enrollmentsQuery = useQuery({
    queryKey: ["enrollments", targetId],
    queryFn: () => listEnrollmentsForUser(targetId),
    enabled: Boolean(authUser && targetId),
  });

  const enrollmentRequestsQuery = useQuery({
    queryKey: ["enrollment-requests", targetId],
    queryFn: () => listEnrollmentRequestsForUser(targetId),
    enabled: Boolean(authUser && targetId),
  });

  const achievementsQuery = useQuery({
    queryKey: ["achievements", targetId],
    queryFn: () => getUserAchievements(targetId),
    enabled: Boolean(authUser && targetId),
  });

  const profileUser = profileQuery.data;

  useEffect(() => {
    if (!profileUser) return;
    setName(profileUser.name || "");
    setDepartment(profileUser.department || "");
    setPhone(profileUser.phone || "");
    setBio(profileUser.bio || "");
  }, [profileUser]);

  const saveMut = useMutation({
    mutationFn: (payload) => updateMyProfile(payload),
    onSuccess: (updatedUser) => {
      qc.invalidateQueries({ queryKey: ["profile", targetId] });
      qc.invalidateQueries({ queryKey: ["achievements", targetId] });
      setSession({ user: updatedUser, accessToken });
      setEditingSelf(false);
      setError("");
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        "Could not save profile";
      setError(typeof msg === "string" ? msg : "Could not save profile");
    },
  });

  const adminSaveMut = useMutation({
    mutationFn: (payload) => updateUser(targetId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", targetId] });
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["achievements", targetId] });
      setEditingOther(false);
      setError("");
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        "Could not save changes";
      setError(typeof msg === "string" ? msg : "Could not save changes");
    },
  });

  function resetFormFromProfile() {
    if (!profileUser) return;
    setName(profileUser.name || "");
    setDepartment(profileUser.department || "");
    setPhone(profileUser.phone || "");
    setBio(profileUser.bio || "");
  }

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      name: name.trim(),
      department: department.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
    };
    if (adminViewingOther) {
      adminSaveMut.mutate(payload);
    } else {
      saveMut.mutate(payload);
    }
  }

  function toggleEditOther() {
    if (editingOther) {
      resetFormFromProfile();
      setEditingOther(false);
    } else {
      setEditingOther(true);
    }
  }

  function toggleEditSelf() {
    if (editingSelf) {
      resetFormFromProfile();
      setEditingSelf(false);
    } else {
      setEditingSelf(true);
    }
  }

  const isOwnEditableProfile = canEdit && !adminViewingOther;
  const showEditForm =
    (isOwnEditableProfile && editingSelf) || (adminViewingOther && editingOther);
  const saving = adminViewingOther ? adminSaveMut.isPending : saveMut.isPending;
  const saveOk = adminViewingOther ? adminSaveMut.isSuccess : saveMut.isSuccess;

  const enrollments = enrollmentsQuery.data || [];
  const requestRows = enrollmentRequestsQuery.data || [];
  const pendingRequests = requestRows.filter((r) => r.status === "pending");
  const rejectedRequests = requestRows.filter((r) => r.status === "rejected");
  const achievements = achievementsQuery.data || [];

  const viewingOwnLearnerProfile =
    authUser?.role === "learner" && String(authUser._id) === String(targetId);

  const enrollmentsShown = useMemo(() => {
    if (!viewingOwnLearnerProfile) return enrollments;
    return enrollments.filter((row) => row.courseId && row.courseId.isPublished !== false);
  }, [enrollments, viewingOwnLearnerProfile]);

  const pendingShown = useMemo(() => {
    if (!viewingOwnLearnerProfile) return pendingRequests;
    return pendingRequests.filter((row) => row.courseId && row.courseId.isPublished !== false);
  }, [pendingRequests, viewingOwnLearnerProfile]);

  const rejectedShown = useMemo(() => {
    if (!viewingOwnLearnerProfile) return rejectedRequests;
    return rejectedRequests.filter((row) => row.courseId && row.courseId.isPublished !== false);
  }, [rejectedRequests, viewingOwnLearnerProfile]);

  const accessLoading = enrollmentsQuery.isLoading || enrollmentRequestsQuery.isLoading;
  const accessError = enrollmentsQuery.isError || enrollmentRequestsQuery.isError;

  if (!authUser) {
    return (
      <Card title="Profile">
        <p className="meta-line">Loading…</p>
      </Card>
    );
  }

  if (
    paramUserId &&
    authUser.role !== "admin" &&
    String(paramUserId) !== String(authUser._id)
  ) {
    return <Navigate to="/profile" replace />;
  }

  if (profileQuery.isLoading || !targetId) {
    return (
      <Card title="Profile">
        <p className="meta-line">Loading…</p>
      </Card>
    );
  }

  if (profileQuery.isError || !profileUser) {
    return (
      <Card title="Profile">
        <p className="error">Could not load this profile.</p>
        <Link to="/" className="inline-link">
          Back to dashboard
        </Link>
      </Card>
    );
  }

  const title = adminViewingOther
    ? `${profileUser.name}'s profile`
    : `Your profile · ${profileUser.name}`;

  return (
    <div className="grid profile-layout">
      <Card
        title={title}
        action={
          adminViewingOther ? (
            <div className="profile-card-actions">
              <Button type="button" variant="secondary" onClick={toggleEditOther}>
                {editingOther ? "Cancel edit" : "Edit user"}
              </Button>
              <Link to="/admin/users" className="inline-link">
                All users
              </Link>
            </div>
          ) : (
            <div className="profile-card-actions">
              {isOwnEditableProfile ? (
                <Button type="button" variant="secondary" onClick={toggleEditSelf}>
                  {editingSelf ? "Cancel edit" : "Edit"}
                </Button>
              ) : null}
              <Link to="/" className="inline-link">
                Back
              </Link>
            </div>
          )
        }
      >
        <p className="lead">
          {profileUser.email} · {profileUser.role}
        </p>
        {isOwnEditableProfile ? (
          <p className="meta-line">
            Email and role are managed by an administrator.
            {!editingSelf ? " Click Edit to update your name, department, phone, or bio." : null}
          </p>
        ) : (
          <p className="meta-line">
            You are viewing this profile as an administrator.
            {!editingOther ? " Click Edit user to change name, department, phone, or bio." : null}
          </p>
        )}

        {showEditForm ? (
          <form className="course-form" onSubmit={onSubmit}>
            <label className="form-field">
              <span>Display name</span>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                autoComplete="name"
              />
            </label>
            <label className="form-field">
              <span>Department (optional)</span>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
              />
            </label>
            <label className="form-field">
              <span>Phone (optional)</span>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                autoComplete="tel"
              />
            </label>
            <label className="form-field">
              <span>Bio (optional)</span>
              <textarea
                className="input textarea-grow"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="A short introduction"
                maxLength={1000}
              />
            </label>
            {error ? <p className="error">{error}</p> : null}
            {saveOk && !error ? (
              <p className="meta-line" role="status">
                {adminViewingOther ? "User updated." : "Profile saved."}
              </p>
            ) : null}
            <div className="row">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              {adminViewingOther && editingOther ? (
                <Button type="button" variant="ghost" onClick={toggleEditOther}>
                  Cancel
                </Button>
              ) : null}
              {isOwnEditableProfile && editingSelf ? (
                <Button type="button" variant="ghost" onClick={toggleEditSelf}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        ) : (
          <div className="profile-readonly course-form">
            <p>
              <strong>Name:</strong> {profileUser.name}
            </p>
            <p>
              <strong>Department:</strong> {profileUser.department || "—"}
            </p>
            <p>
              <strong>Phone:</strong> {profileUser.phone || "—"}
            </p>
            <p>
              <strong>Bio:</strong> {profileUser.bio || "—"}
            </p>
          </div>
        )}
      </Card>

      <Card title="Courses & access">
        {accessError ? (
          <p className="error">Could not load enrollments or access requests.</p>
        ) : accessLoading ? (
          <p className="meta-line">Loading…</p>
        ) : (
          <>
            <section className="enrollment-section" aria-labelledby="enrolled-heading">
              <h3 id="enrolled-heading" className="enrollment-section-title">
                Enrolled
              </h3>
              <p className="meta-line subsection-hint">Courses this user can access today.</p>
              {enrollmentsShown.length === 0 ? (
                <p className="lead enrollment-empty">No active enrollments.</p>
              ) : (
                <ul className="enrollment-list">
                  {enrollmentsShown.map((row) => {
                    const course = row.courseId;
                    const cid = course?._id ?? row.courseId;
                    const titleCourse = course?.title || "Course";
                    const progress = row.progressPercent ?? 0;
                    const done =
                      row.completedAt ||
                      (typeof progress === "number" && progress >= 100);
                    return (
                      <li key={row._id} className="enrollment-row">
                        <div>
                          <strong>{titleCourse}</strong>
                          <span className="meta-line">
                            {" "}
                            · Progress {progress}%{" "}
                            {done ? "· Completed" : ""}
                          </span>
                        </div>
                        {cid ? (
                          <Link to={`/courses/${cid}`} className="inline-link">
                            Open course
                          </Link>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="enrollment-section" aria-labelledby="pending-heading">
              <h3 id="pending-heading" className="enrollment-section-title">
                Pending requests
              </h3>
              <p className="meta-line subsection-hint">
                Waiting for faculty or admin approval ({pendingShown.length}).
              </p>
              {pendingShown.length === 0 ? (
                <p className="lead enrollment-empty">No pending access requests.</p>
              ) : (
                <ul className="enrollment-list">
                  {pendingShown.map((row) => {
                    const course = row.courseId;
                    const cid = course?._id ?? row.courseId;
                    const titleCourse = course?.title || "Course";
                    return (
                      <li key={row._id} className="enrollment-row enrollment-request enrollment-request--pending">
                        <div>
                          <strong>{titleCourse}</strong>
                          {row.note ? (
                            <span className="meta-line request-note">Note: {row.note}</span>
                          ) : null}
                          <span className="meta-line">
                            Requested {formatShortDate(row.createdAt) || "—"}
                          </span>
                        </div>
                        {cid ? (
                          <Link to={`/courses/${cid}`} className="inline-link">
                            View course
                          </Link>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="enrollment-section" aria-labelledby="rejected-heading">
              <h3 id="rejected-heading" className="enrollment-section-title">
                Rejected
              </h3>
              <p className="meta-line subsection-hint">
                Requests that were not approved ({rejectedShown.length}).
              </p>
              {rejectedShown.length === 0 ? (
                <p className="lead enrollment-empty">No rejected requests on record.</p>
              ) : (
                <ul className="enrollment-list">
                  {rejectedShown.map((row) => {
                    const course = row.courseId;
                    const cid = course?._id ?? row.courseId;
                    const titleCourse = course?.title || "Course";
                    return (
                      <li key={row._id} className="enrollment-row enrollment-request enrollment-request--rejected">
                        <div>
                          <strong>{titleCourse}</strong>
                          {row.note ? (
                            <span className="meta-line request-note">Original note: {row.note}</span>
                          ) : null}
                          <span className="meta-line">
                            Updated {formatShortDate(row.reviewedAt || row.updatedAt) || "—"}
                          </span>
                        </div>
                        {cid ? (
                          <Link to={`/courses/${cid}`} className="inline-link">
                            View course
                          </Link>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </Card>

      <Card title="Achievements">
        {achievementsQuery.isLoading ? (
          <p className="meta-line">Loading achievements…</p>
        ) : achievementsQuery.isError ? (
          <p className="error">Could not load achievements.</p>
        ) : achievements.length === 0 ? (
          <p className="lead">
            Complete courses and leave feedback to earn badges. Badges appear here when you qualify.
          </p>
        ) : (
          <ul className="badge-grid">
            {achievements.map((b) => (
              <li key={b.id} className="badge-card">
                <strong>{b.title}</strong>
                <p className="meta-line">{b.description}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
