import { useEffect, useState } from "react";
import { getUsers } from "../api/users";

export default function AdminUsers() {
  const [role, setRole] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  function load() {
    setError("");
    getUsers(role || undefined)
      .then((res) => setUsers(res.data || []))
      .catch(() => setError("Could not load users."));
  }

  useEffect(() => {
    load();
  }, [role]);

  return (
    <div>
      <h1>Users</h1>
      <p style={{ color: "var(--muted)" }}>
        View faculty and learners (and admins). Filter by role.
      </p>
      <label>Filter by role</label>
      <select value={role} onChange={(e) => setRole(e.target.value)} style={{ maxWidth: 200 }}>
        <option value="">All</option>
        <option value="admin">Admin</option>
        <option value="faculty">Faculty</option>
        <option value="learner">Learner</option>
      </select>
      {error && <p className="error">{error}</p>}
      <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
            <th style={{ padding: "0.5rem" }}>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "0.5rem" }}>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <span className="badge">{u.role}</span>
              </td>
              <td>{u.department || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
