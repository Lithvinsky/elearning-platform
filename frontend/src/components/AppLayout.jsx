import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useId, useState } from "react";
import { AppLogo } from "./AppLogo";
import { Button } from "./ui/Button";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../api/services/authService";

function navLinkClass({ isActive }) {
  return `nav-link ${isActive ? "nav-active" : ""}`;
}

function MainNavLinks({ onNavigate }) {
  const { user } = useAuth();
  return (
    <>
      <NavLink to="/" className={navLinkClass} end onClick={onNavigate}>
        Dashboard
      </NavLink>
      <NavLink to="/courses" className={navLinkClass} onClick={onNavigate}>
        Courses
      </NavLink>
      {user?.role === "admin" ? (
        <NavLink to="/admin/users" className={navLinkClass} onClick={onNavigate}>
          Users
        </NavLink>
      ) : null}
      {user?.role === "admin" || user?.role === "faculty" ? (
        <NavLink to="/admin/requests" className={navLinkClass} onClick={onNavigate}>
          Requests
        </NavLink>
      ) : null}
    </>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const { user, clearSession, theme, toggleTheme } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const titleId = useId();

  const closeNav = useCallback(() => setNavOpen(false), []);

  useEffect(() => {
    if (!navOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [navOpen]);

  async function handleLogout() {
    closeNav();
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
        <nav className="top-links top-links--desktop" aria-label="Main navigation">
          <MainNavLinks />
        </nav>
        <div className="top-user top-user--desktop">
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
        <button
          type="button"
          className="topbar__menu-btn"
          aria-label="Open menu"
          aria-expanded={navOpen}
          aria-controls="mobile-nav-drawer"
          onClick={() => setNavOpen(true)}
        >
          <span className="topbar__menu-icon" aria-hidden />
        </button>
      </header>

      <div
        className={`mobile-nav-backdrop${navOpen ? " mobile-nav-backdrop--open" : ""}`}
        aria-hidden={!navOpen}
        onClick={closeNav}
      />
      <div
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer${navOpen ? " mobile-nav-drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!navOpen}
      >
        <div className="mobile-nav-drawer__header">
          <span id={titleId} className="mobile-nav-drawer__title">
            Menu
          </span>
          <button
            type="button"
            className="mobile-nav-drawer__close"
            aria-label="Close menu"
            onClick={closeNav}
          >
            ×
          </button>
        </div>
        <nav className="mobile-nav-drawer__links" aria-label="Main navigation">
          <MainNavLinks onNavigate={closeNav} />
        </nav>
        <div className="mobile-nav-drawer__footer">
          <Link
            to="/profile"
            className="user-pill user-pill-link mobile-nav-drawer__profile"
            title="Edit your profile"
            onClick={closeNav}
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
      </div>

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
