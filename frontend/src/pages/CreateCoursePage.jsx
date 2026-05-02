import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { createCourse } from "../api/services/courseService";
import { listUsers } from "../api/services/userService";
import { useAuth } from "../hooks/useAuth";
import { CourseMaterialsEditor, materialsForApi } from "../components/CourseMaterialsEditor";

export function CreateCoursePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("beginner");
  const [durationHours, setDurationHours] = useState("0");
  const [selectedFaculty, setSelectedFaculty] = useState(() => new Set());
  const [materialRows, setMaterialRows] = useState([]);
  const [error, setError] = useState("");

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
    enabled: user?.role === "admin",
  });

  const facultyList = useMemo(
    () => (usersQuery.data || []).filter((u) => u.role === "faculty"),
    [usersQuery.data],
  );

  function toggleFaculty(id) {
    const key = String(id);
    setSelectedFaculty((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const createMut = useMutation({
    mutationFn: (payload) => createCourse(payload),
    onSuccess: (course) => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      navigate(`/courses/${course._id}`);
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        "Could not create course";
      setError(typeof msg === "string" ? msg : "Could not create course");
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
    };
    const cat = category.trim();
    if (cat) payload.category = cat;
    if (user?.role === "admin") {
      payload.facultyIds = Array.from(selectedFaculty);
    }
    const mats = materialsForApi(materialRows);
    if (mats.length > 0) payload.materials = mats;
    createMut.mutate(payload);
  }

  return (
    <Card
      title="Add course"
      action={
        <Link to="/courses" className="inline-link">
          Back to catalog
        </Link>
      }
    >
      <p className="lead">
        {user?.role === "faculty"
          ? "You will be listed as the instructor for this course."
          : "Assign faculty now or leave empty and edit the course later."}
      </p>
      <form className="course-form" onSubmit={onSubmit}>
        <label className="form-field">
          <span>Title</span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            placeholder="e.g. Introduction to Databases"
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
            placeholder="What learners will gain from this course"
          />
        </label>
        <label className="form-field">
          <span>Category (optional)</span>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Computer Science"
          />
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

        {user?.role === "admin" ? (
          <fieldset className="faculty-fieldset">
            <legend>Faculty</legend>
            {usersQuery.isLoading ? <p className="meta-line">Loading users…</p> : null}
            {usersQuery.isError ? (
              <p className="error">Could not load users. You can still create the course without faculty.</p>
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
                <p className="meta-line">No faculty accounts yet — create users or assign later.</p>
              ) : null}
            </div>
          </fieldset>
        ) : null}

        {error ? <p className="error">{error}</p> : null}
        <div className="row">
          <Button type="submit" disabled={createMut.isPending}>
            {createMut.isPending ? "Creating…" : "Publish course"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate("/courses")}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
