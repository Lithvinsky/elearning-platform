const STORAGE_KEY = "learnease_recent_courses_v1";
const MAX_ITEMS = 8;

export function pushRecentCourse({ id, title }) {
  if (!id || !title) return;
  try {
    const prev = getRecentCourses();
    const next = [{ id: String(id), title: String(title).slice(0, 120), at: Date.now() }]
      .concat(prev.filter((x) => x.id !== String(id)))
      .slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

export function getRecentCourses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Drop entries whose course id is not in the published catalog (removes deleted / unpublished / stale ids). */
export function pruneRecentToPublishedCourseIds(publishedCourseIds) {
  const allowed = new Set((publishedCourseIds || []).map((id) => String(id)));
  try {
    const prev = getRecentCourses();
    const next = prev.filter((x) => allowed.has(String(x.id)));
    if (next.length !== prev.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    return next;
  } catch {
    return getRecentCourses();
  }
}
