import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { AppLogo } from "../components/AppLogo";
import { register } from "../api/services/authService";
import { useAuth } from "../hooks/useAuth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, setSession } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("learner");
  const [clientError, setClientError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  function goToPasswordStep() {
    setError("");
    setClientError("");
    const n = name.trim();
    if (n.length < 2) {
      setClientError("Enter your full name (at least 2 characters).");
      return;
    }
    const em = email.trim();
    if (!EMAIL_RE.test(em)) {
      setClientError("Enter a valid email address.");
      return;
    }
    setStep(1);
  }

  function backToDetails() {
    setClientError("");
    setError("");
    setStep(0);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setClientError("");
    if (password.length < 8) {
      setClientError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const data = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      setSession(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const combinedError = clientError || error;

  return (
    <div className="auth-page">
      <Card>
        <AppLogo showText />
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join LearnEase Pro as a learner or faculty member.</p>
        <form onSubmit={step === 1 ? onSubmit : (e) => e.preventDefault()} className="auth-form">
          {step === 0 ? (
            <>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                autoComplete="name"
              />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
              />
              {combinedError ? <p className="error">{combinedError}</p> : null}
              <Button type="button" onClick={goToPasswordStep}>
                Continue
              </Button>
            </>
          ) : (
            <>
              <p className="meta-line">
                <strong>{name.trim()}</strong>
                <br />
                <span className="meta-line">{email.trim()}</span>
              </p>
              <Button type="button" variant="ghost" onClick={backToDetails}>
                ← Edit name and email
              </Button>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 8)"
                autoComplete="new-password"
                minLength={8}
              />
              <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="learner">Learner</option>
                <option value="faculty">Faculty</option>
              </select>
              {combinedError ? <p className="error">{combinedError}</p> : null}
              <Button type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Register"}
              </Button>
            </>
          )}
        </form>
        <p className="switch-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
