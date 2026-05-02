import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { deleteCourse, getCourse, updateCourse } from "../api/services/courseService";
import { listUsers } from "../api/services/userService";
import { CourseMaterialsEditor, materialsForApi, rowsFromApi } from "../components/CourseMaterialsEditor";

export function EditCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const hydrated = useRef(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("beginner");
  const [durationHours, setDurationHours] = useState("0");
  const [isPublished, setIsPublished] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState(() => new Set());
  const [materialRows, setMaterialRows] = useState([]);
  const [error, setError] = useState("");

  const courseQuery = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourse(id),
    enabled: Boolean(id),
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
  });

  const facultyList = useMemo(
    () => (usersQuery.data || []).filter((u) => u.role === "faculty"),
    [usersQuery.data],
  );

  useEffect(() => {
    hydrated.current = false;
  }, [id]);

  useEffect(() => {
    const course = courseQuery.data;
    if (!course || String(course._id) !== String(id) || hydrated.current) return;
    hydrated.current = true;
    setTitle(course.title || "");
    setDescription(course.description || "");
    setCategory(course.category || "");
    setLevel(course.level || "beginner");
    setDurationHours(String(course.durationHours ?? 0));
    setIsPublished(course.isPublished !== false);
    const ids = (course.facultyIds || []).map((f) =>
      typeof f === "object" && f != null && f._id != null ? String(f._id) : String(f),
    );
    setSelectedFaculty(new Set(ids));
    setMaterialRows(rowsFromApi(course.materials));
  }, [courseQuery.data, id]);

  function toggleFaculty(fid) {
    const key = String(fid);
    setSelectedFaculty((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const updateMut = useMutation({
    mutationFn: (payload) => updateCourse(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["course", id] });
      navigate(`/courses/${id}`);
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        "Could not save course";
      setError(typeof msg === "string" ? msg : "Could not save course");
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteCourse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.removeQueries({ queryKey: ["course", id] });
      navigate("/courses");
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Could not delete course";
      setError(typeof msg === "string" ? msg : "Could not delete course");
    },
  });

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    const hours = Number(durationHours);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      level,
      durationHours: Number.isFinite(hours) && hours >= 0 ? hours : 0,
      isPublished,
      facultyIds: Array.from(selectedFaculty),
    };
    const cat = category.trim();
    payload.category = cat;
    payload.materials = materialsForApi(materialRows);
    updateMut.mutate(payload);
  }

  function onDelete() {
    if (!window.confirm("Delete this course permanently? This cannot be undone.")) return;
    setError("");
    deleteMut.mutate();
  }

  if (courseQuery.isLoading) {
    return (
      <Card title="Edit course">
        <p className="lead">Loading…</p>
      </Card>
    );
  }

  if (courseQuery.isError || !courseQuery.data) {
    return (
      <Card title="Edit course">
        <p className="error">Course not found or you don’t have access.</p>
        <Link to="/courses" className="inline-link">
          Back to catalog
        </Link>
      </Card>
    );
  }

  const busy = updateMut.isPending || deleteMut.isPending;

  return (
    <Card
      title="Edit course"
      action={
        <Link to={`/courses/${id}`} className="inline-link">
          View course
        </Link>
      }
    >
      <form className="course-form" onSubmit={onSubmit}>
        <label className="form-field checkbox-row" style={{ cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <span>Published (visible in catalog)</span>
        </label>

        <label className="form-field">
          <span>Title</span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
          />
        </label>
        <label className="form-field">
          <span>Description (min. 10 characters)</span>
          <textarea
            className="input textarea-grow"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={10}
            rows={5}
          />
        </label>
        <label className="form-field">
          <span>Category (optional)</span>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} />
        </label>
        <div className="form-row">
          <label className="form-field">
            <span>Level</span>
            <select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <label className="form-field">
            <span>Duration (hours)</span>
            <Input
              type="number"
              min={0}
              step={1}
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
            />
          </label>
        </div>

        <CourseMaterialsEditor materials={materialRows} onChange={setMaterialRows} />

        <fieldset className="faculty-fieldset">
          <legend>Faculty</legend>
          {usersQuery.isLoading ? <p className="meta-line">Loading users…</p> : null}
          {usersQuery.isError ? (
            <p className="error">Could not load users for faculty assignment.</p>
          ) : null}
          <div className="faculty-checkboxes">
            {facultyList.map((f) => (
              <label key={f._id} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={selectedFaculty.has(String(f._id))}
                  onChange={() => toggleFaculty(f._id)}
                />
                <span>
                  {f.name} <span className="meta-line">({f.email})</span>
                </span>
              </label>
            ))}
            {!usersQuery.isLoading && facultyList.length === 0 ? (
              <p className="meta-line">No faculty accounts in the system.</p>
            ) : null}
          </div>
        </fieldset>

        {error ? <p className="error">{error}</p> : null}
        <div className="row">
          <Button type="submit" disabled={busy}>
            {updateMut.isPending ? "Saving…" : "Save changes"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate(`/courses/${id}`)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" disabled={busy} onClick={onDelete}>
            {deleteMut.isPending ? "Deleting…" : "Delete course"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
