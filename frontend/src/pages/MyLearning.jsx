import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyEnrollments } from "../api/enrollments";

export default function MyLearning() {
  const [list, setList] = useState([]);

  useEffect(() => {
    getMyEnrollments()
      .then((res) => setList(res.data || []))
      .catch(() => setList([]));
  }, []);

  return (
    <div>
      <h1>My learning</h1>
      <p style={{ color: "var(--muted)" }}>Courses you are enrolled in.</p>
      {list.length === 0 && <p>No enrollments yet. Request access from a course page.</p>}
      <div className="grid2">
        {list.map((e) => {
          const c = e.courseId;
          if (!c) return null;
          return (
            <Link key={e._id} to={`/courses/${c._id}`} style={{ textDecoration: "none" }}>
              <div className="card">
                <h2 style={{ marginTop: 0, color: "var(--text)" }}>{c.title}</h2>
                <p>Progress: {e.progressPercent ?? 0}%</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
