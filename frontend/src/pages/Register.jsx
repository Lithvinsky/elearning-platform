import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "learner",
    department: "",
  });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 440 }}>
        <h1 style={{ marginTop: 0 }}>Register</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Sign up as a <strong>learner</strong> or <strong>faculty</strong>. Admins
          are created by the platform.
        </p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Full name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <label style={{ marginTop: "0.75rem" }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <label style={{ marginTop: "0.75rem" }}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
          <label style={{ marginTop: "0.75rem" }}>Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="learner">Learner</option>
            <option value="faculty">Faculty</option>
          </select>
          {form.role === "faculty" && (
            <>
              <label style={{ marginTop: "0.75rem" }}>Department</label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g. Computer Science"
              />
            </>
          )}
          <button type="submit" style={{ marginTop: "1rem", width: "100%" }}>
            Create account
          </button>
        </form>
        <p style={{ marginTop: "1rem" }}>
          <Link to="/login">Already have an account?</Link>
        </p>
      </div>
    </div>
  );
}
