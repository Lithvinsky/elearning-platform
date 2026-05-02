import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { AppLogo } from "../components/AppLogo";
import { register } from "../api/services/authService";
import { useAuth } from "../hooks/useAuth";

export function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, setSession } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("learner");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await register({ name, email, password, role });
      setSession(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <Card>
        <AppLogo showText />
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join LearnEase Pro as a learner or faculty member.</p>
        <form onSubmit={onSubmit} className="auth-form">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8)"
            required
          />
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="learner">Learner</option>
            <option value="faculty">Faculty</option>
          </select>
          {error ? <p className="error">{error}</p> : null}
          <Button disabled={loading}>{loading ? "Creating account..." : "Register"}</Button>
        </form>
        <p className="switch-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
