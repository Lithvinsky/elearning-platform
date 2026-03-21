import { Outlet, NavLink, Link } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="nav">
        <Link to="/" style={{ fontWeight: 800, color: "var(--text)" }}>
          LMS
        </Link>
        <NavLink to="/" end>
          Courses
        </NavLink>
        {user?.role === "learner" && (
          <NavLink to="/my-learning">My learning</NavLink>
        )}
        {(user?.role === "admin" || user?.role === "faculty") && (
          <NavLink to="/requests">Access requests</NavLink>
        )}
        {user?.role === "admin" && (
          <>
            <NavLink to="/admin/users">Users</NavLink>
            <NavLink to="/admin/courses/new">New course</NavLink>
          </>
        )}
        <NavLink to="/profile">Profile</NavLink>
        <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: "0.9rem" }}>
          {user?.name} · <span className="badge">{user?.role}</span>
        </span>
        <button type="button" className="secondary" onClick={logout}>
          Log out
        </button>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
