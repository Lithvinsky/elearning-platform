import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { API_ORIGIN } from "../api/axiosClient";
import {
  getCourse,
  requestCourseAccess,
  deleteMaterial,
} from "../api/courses";
import { getMyEnrollments, updateProgress } from "../api/enrollments";
import { getFeedback, submitFeedback } from "../api/feedback";
import { getMessages, postMessage } from "../api/messages";

function materialUrl(url) {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${API_ORIGIN}${path}`;
}

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [enrolled, setEnrolled] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msgBody, setMsgBody] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [chatError, setChatError] = useState("");

  const loadCourse = useCallback(() => {
    getCourse(id)
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load course."));
  }, [id]);

  const loadFeedback = useCallback(() => {
    getFeedback(id)
      .then((res) => setFeedbacks(res.data || []))
      .catch(() => {});
  }, [id]);

  const loadMessages = useCallback(() => {
    getMessages(id)
      .then((res) => setMessages(res.data || []))
      .catch(() => setChatError("Chat unavailable (enroll or be faculty)."));
  }, [id]);

  useEffect(() => {
    setError("");
    loadCourse();
    loadFeedback();
  }, [loadCourse, loadFeedback]);

  useEffect(() => {
    if (user?.role === "learner") {
      getMyEnrollments()
        .then((res) => {
          const list = res.data || [];
          const e = list.find((x) => String(x.courseId?._id || x.courseId) === id);
          setEnrolled(e || false);
        })
        .catch(() => setEnrolled(false));
    } else {
      setEnrolled(null);
    }
  }, [user, id]);

  useEffect(() => {
    setChatError("");
    loadMessages();
  }, [loadMessages]);

  const course = data?.course;
  const summary = data?.feedbackSummary;

  const canEdit =
    user &&
    course &&
    (user.role === "admin" ||
      (user.role === "faculty" &&
        course.facultyIds?.some(
          (f) => String(f._id || f) === String(user._id),
        )));

  async function handleRequest() {
    try {
      await requestCourseAccess(id, "");
      alert("Access request submitted.");
    } catch (err) {
      alert(err.response?.data?.error || "Request failed");
    }
  }

  async function handleFeedback(e) {
    e.preventDefault();
    try {
      await submitFeedback(id, rating, comment);
      setComment("");
      loadFeedback();
      loadCourse();
    } catch (err) {
      alert(err.response?.data?.error || "Could not save feedback");
    }
  }

  async function handleSendChat(e) {
    e.preventDefault();
    if (!msgBody.trim()) return;
    try {
      await postMessage(id, msgBody);
      setMsgBody("");
      loadMessages();
    } catch (err) {
      alert(err.response?.data?.error || "Could not send");
    }
  }

  async function handleProgress(e) {
    const v = Number(e.target.value);
    try {
      const res = await updateProgress(id, v);
      setEnrolled(res.data);
    } catch {
      /* ignore */
    }
  }

  async function handleDeleteMaterial(materialId) {
    if (!confirm("Remove this material?")) return;
    try {
      await deleteMaterial(id, materialId);
      loadCourse();
    } catch {
      alert("Could not delete");
    }
  }

  if (error || (!course && error)) {
    return <p className="error">{error || "Not found"}</p>;
  }
  if (!course) return <p>Loading…</p>;

  return (
    <div>
      <p>
        <Link to="/">← Courses</Link>
        {canEdit && (
          <>
            {" · "}
            <Link to={`/edit-course/${id}`}>Edit course</Link>
          </>
        )}
      </p>
      <h1>{course.title}</h1>
      <p style={{ color: "var(--muted)" }}>{course.description}</p>
      <p>
        <span className="badge">{course.level}</span>{" "}
        {course.durationHours ? `${course.durationHours} hours` : ""}
        {summary?.count > 0 && (
          <span style={{ marginLeft: "0.5rem" }}>
            ★ {summary.averageRating} ({summary.count} reviews)
          </span>
        )}
      </p>

      <h2>Faculty</h2>
      <ul>
        {(course.facultyIds || []).map((f) => (
          <li key={f._id || f}>
            {f.name} ({f.email})
          </li>
        ))}
      </ul>

      <h2>Learning materials</h2>
      <ul style={{ paddingLeft: "1.2rem" }}>
        {(course.materials || []).map((m) => (
          <li key={m._id} style={{ marginBottom: "0.5rem" }}>
            <a href={materialUrl(m.url)} target="_blank" rel="noreferrer">
              {m.title}
            </a>{" "}
            <span className="badge">{m.type}</span>
            {canEdit && (
              <button
                type="button"
                className="danger"
                style={{ marginLeft: "0.5rem", padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                onClick={() => handleDeleteMaterial(m._id)}
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {user?.role === "learner" && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          {!enrolled ? (
            <>
              <h3>Get access</h3>
              <p style={{ color: "var(--muted)" }}>
                Request access to use progress tracking, feedback, and group chat.
              </p>
              <button type="button" onClick={handleRequest}>
                Request course access
              </button>
            </>
          ) : (
            <>
              <h3>Your progress</h3>
              <label>
                {enrolled.progressPercent ?? 0}%
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={enrolled.progressPercent ?? 0}
                  onChange={handleProgress}
                  style={{ width: "100%" }}
                />
              </label>
            </>
          )}
        </div>
      )}

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h3>Feedback & ratings</h3>
        {feedbacks.length === 0 && (
          <p style={{ color: "var(--muted)" }}>No reviews yet.</p>
        )}
        <ul style={{ paddingLeft: "1.2rem" }}>
          {feedbacks.map((f) => (
            <li key={f._id}>
              <strong>{f.learnerId?.name || "Learner"}</strong> — {f.rating}/5 —{" "}
              {f.comment}
            </li>
          ))}
        </ul>
        {user?.role === "learner" && enrolled && (
          <form onSubmit={handleFeedback} style={{ marginTop: "1rem" }}>
            <label>Your rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <label style={{ marginTop: "0.5rem" }}>Comment</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit" style={{ marginTop: "0.5rem" }}>
              Submit feedback
            </button>
          </form>
        )}
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h3>Group chat</h3>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Collaborative discussion for enrolled learners, assigned faculty, and admins.
        </p>
        {chatError && <p className="error">{chatError}</p>}
        <div
          style={{
            maxHeight: 280,
            overflowY: "auto",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          {messages.map((m) => (
            <div key={m._id} style={{ marginBottom: "0.75rem" }}>
              <strong>{m.senderId?.name}</strong>{" "}
              <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                ({m.senderId?.role})
              </span>
              <div>{m.body}</div>
            </div>
          ))}
        </div>
        {!chatError && (
          <form onSubmit={handleSendChat}>
            <input
              value={msgBody}
              onChange={(e) => setMsgBody(e.target.value)}
              placeholder="Write a message…"
            />
            <button type="submit" style={{ marginTop: "0.5rem" }}>
              Send
            </button>
          </form>
        )}
        <button
          type="button"
          className="secondary"
          style={{ marginTop: "0.5rem" }}
          onClick={loadMessages}
        >
          Refresh chat
        </button>
      </div>
    </div>
  );
}
