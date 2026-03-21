import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../api/courses";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getCourses()
      .then((res) => setCourses(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Could not load courses."));
  }, []);

  return (
    <div>
      <h1>Courses</h1>
      <p style={{ color: "var(--muted)" }}>
        Browse programs, materials, and group discussions. Request access to
        join as a learner.
      </p>
      {error && <p className="error">{error}</p>}
      <div className="grid2" style={{ marginTop: "1.5rem" }}>
        {courses.map((c) => (
          <Link key={c._id} to={`/courses/${c._id}`} style={{ textDecoration: "none" }}>
            <div className="card" style={{ height: "100%" }}>
              <h2 style={{ marginTop: 0, color: "var(--text)" }}>{c.title}</h2>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                {c.description?.slice(0, 140)}
                {(c.description?.length || 0) > 140 ? "…" : ""}
              </p>
              <p style={{ fontSize: "0.85rem" }}>
                <span className="badge">{c.level}</span>{" "}
                {c.durationHours ? `${c.durationHours}h` : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {courses.length === 0 && !error && (
        <p style={{ color: "var(--muted)" }}>No courses yet.</p>
      )}
    </div>
  );
}
