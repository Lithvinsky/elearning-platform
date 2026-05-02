import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { AppLogo } from "./AppLogo";
import { Button } from "./ui/Button";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../api/services/authService";
import { useEffect } from "react";

export function AppLayout() {
  const navigate = useNavigate();
  const { user, clearSession, theme, toggleTheme } = useAuth();

  useEffect(() => {
    document.body.classList.toggle("theme-dark", theme === "dark");
  }, [theme]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      clearSession();
      navigate("/login");
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar topbar--sticky">
        <AppLogo />
        <nav className="top-links" aria-label="Main navigation">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? "nav-active" : ""}`}
            end
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/courses"
            className={({ isActive }) => `nav-link ${isActive ? "nav-active" : ""}`}
          >
            Courses
          </NavLink>
          {user?.role === "admin" ? (
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `nav-link ${isActive ? "nav-active" : ""}`}
            >
              Users
            </NavLink>
          ) : null}
          {(user?.role === "admin" || user?.role === "faculty") ? (
            <NavLink
              to="/admin/requests"
              className={({ isActive }) => `nav-link ${isActive ? "nav-active" : ""}`}
            >
              Requests
            </NavLink>
          ) : null}
        </nav>
        <div className="top-user">
          <Link
            to="/profile"
            className="user-pill user-pill-link"
            title="Edit your profile"
          >
            {user?.name || "Profile"}
          </Link>
          <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand-block">
            <div className="footer-brand">
              <span className="footer-title">LearnEase Pro</span>
              <span className="footer-tag">MERN LMS</span>
            </div>
            <p className="footer-blurb">
              Browse courses, manage enrollments, and stay in touch with instructors—all in one place.
            </p>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">
              © {new Date().getFullYear()} LearnEase Pro · Demo learning workspace
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
