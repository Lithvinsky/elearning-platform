import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Skeleton } from "../components/ui/Skeleton";
import { RoleBadge } from "../components/ui/Badge";
import { listUsers } from "../api/services/userService";

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "joined-desc", label: "Newest accounts" },
  { value: "joined-asc", label: "Oldest accounts" },
];

const ROLE_FILTERS = [
  { value: "all", label: "All roles" },
  { value: "admin", label: "Admin" },
  { value: "faculty", label: "Faculty" },
  { value: "learner", label: "Learner" },
];

function formatJoined(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function AdminUsersPage() {
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: listUsers });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [roleFilter, setRoleFilter] = useState("all");

  const raw = usersQuery.data || [];
  const total = raw.length;

  const counts = useMemo(() => {
    let admin = 0;
    let faculty = 0;
    let learner = 0;
    for (const u of raw) {
      if (u.role === "admin") admin += 1;
      else if (u.role === "faculty") faculty += 1;
      else learner += 1;
    }
    return { admin, faculty, learner };
  }, [raw]);

  const displayUsers = useMemo(() => {
    let list = [...raw];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.department || "").toLowerCase().includes(q),
      );
    }
    if (roleFilter !== "all") {
      list = list.filter((u) => u.role === roleFilter);
    }
    list.sort((a, b) => {
      switch (sort) {
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "", undefined, { sensitivity: "base" });
        case "joined-desc":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "joined-asc":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "name-asc":
        default:
          return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
      }
    });
    return list;
  }, [raw, search, sort, roleFilter]);

  const shown = displayUsers.length;

  function clearFilters() {
    setSearch("");
    setRoleFilter("all");
  }

  const hasActiveFilters = Boolean(search.trim()) || roleFilter !== "all";

  return (
    <Card title="Users">
      <p className="page-intro">
        Search and filter workspace accounts. Open a profile to edit details, see enrollments, and view
        achievements.
      </p>

      {!usersQuery.isLoading && !usersQuery.isError && total > 0 ? (
        <p className="admin-users-summary meta-line" aria-live="polite">
          <strong>{total}</strong> accounts · {counts.admin} admin · {counts.faculty} faculty ·{" "}
          {counts.learner} learners
        </p>
      ) : null}

      {!usersQuery.isLoading && !usersQuery.isError && total > 0 ? (
        <div className="catalog-toolbar admin-users-toolbar">
          <label className="catalog-search">
            <span className="sr-only">Search users</span>
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or department…"
              autoComplete="off"
              className="catalog-search-input"
            />
          </label>
          <label className="catalog-sort admin-users-role">
            <span className="catalog-sort-label">Role</span>
            <select
              className="input catalog-sort-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              {ROLE_FILTERS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="catalog-sort">
            <span className="catalog-sort-label">Sort</span>
            <select className="input catalog-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <p className="catalog-count meta-line" aria-live="polite">
            Showing {shown} of {total}
            {hasActiveFilters ? (
              <>
                {" "}
                <button type="button" className="link-button" onClick={clearFilters}>
                  Clear filters
                </button>
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      {usersQuery.isLoading ? (
        <div className="course-skeleton-list" aria-busy="true">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="list-item skeleton-course-row">
              <Skeleton className="skeleton-shorter" />
              <Skeleton lines={2} />
            </div>
          ))}
        </div>
      ) : null}

      {usersQuery.isError ? (
        <p className="error">Could not load users. Check your connection and try again.</p>
      ) : null}

      {!usersQuery.isLoading && !usersQuery.isError ? (
        <>
          {displayUsers.length > 0 ? (
            <div className="list admin-users-list">
              {displayUsers.map((u) => (
                <Link key={u._id} to={`/profile/${u._id}`} className="list-item-link">
                  <article className="list-item user-row">
                    <div className="user-row-head">
                      <h4 className="user-row-name">{u.name}</h4>
                      <RoleBadge role={u.role} />
                    </div>
                    <p className="user-row-email">{u.email}</p>
                    {u.department ? <p className="meta-line user-row-dept">{u.department}</p> : null}
                    <p className="meta-line user-row-foot">
                      Joined {formatJoined(u.createdAt) || "—"}
                      <span className="user-row-sep" aria-hidden>
                        ·
                      </span>
                      <span className="user-row-cta">Open profile</span>
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          ) : total > 0 ? (
            <div className="empty-panel empty-panel--compact">
              <p className="empty-title">No matches</p>
              <p className="meta-line">Try another search or widen the role filter.</p>
              <button type="button" className="btn btn-secondary empty-cta" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="empty-panel empty-panel--compact">
              <p className="empty-title">No users</p>
              <p className="meta-line">Seed the database or create accounts to see them listed here.</p>
            </div>
          )}
        </>
      ) : null}
    </Card>
  );
}
