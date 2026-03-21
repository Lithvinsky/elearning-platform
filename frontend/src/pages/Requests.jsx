import { useEffect, useState } from "react";
import {
  getEnrollmentRequests,
  updateEnrollmentRequest,
} from "../api/enrollments";

export default function Requests() {
  const [list, setList] = useState([]);
  const [error, setError] = useState("");

  function load() {
    getEnrollmentRequests()
      .then((res) => setList(res.data || []))
      .catch(() => setError("Could not load requests."));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatus(requestId, status) {
    try {
      await updateEnrollmentRequest(requestId, status);
      load();
    } catch {
      alert("Update failed");
    }
  }

  return (
    <div>
      <h1>Course access requests</h1>
      <p style={{ color: "var(--muted)" }}>
        Approve or reject learner requests. Admins see all; faculty see their courses only.
      </p>
      {error && <p className="error">{error}</p>}
      {list.length === 0 && !error && <p>No pending or past requests.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {list.map((r) => (
          <li key={r._id} className="card" style={{ marginBottom: "0.75rem" }}>
            <strong>{r.learnerId?.name}</strong> ({r.learnerId?.email}) →{" "}
            <strong>{r.courseId?.title}</strong>
            <div style={{ marginTop: "0.5rem" }}>
              <span className="badge">{r.status}</span>
              {r.status === "pending" && (
                <>
                  <button
                    type="button"
                    style={{ marginLeft: "0.5rem" }}
                    onClick={() => handleStatus(r._id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    style={{ marginLeft: "0.5rem" }}
                    onClick={() => handleStatus(r._id, "rejected")}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
