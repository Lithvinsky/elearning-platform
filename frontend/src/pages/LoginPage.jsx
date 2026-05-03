import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { AppLogo } from "../components/AppLogo";
import { login } from "../api/services/authService";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ email, password });
      setSession(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <Card>
        <AppLogo showText />
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">Access your courses, requests, and group discussions.</p>
        <form onSubmit={onSubmit} className="auth-form" autoComplete="on">
          <Input
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            enterKeyHint="next"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            enterKeyHint="go"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          {error ? <p className="error">{error}</p> : null}
          <Button disabled={loading}>{loading ? "Signing in..." : "Login"}</Button>
        </form>
        <p className="switch-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </Card>
    </div>
  );
}
