import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { getCourse, createCourse, updateCourse, addMaterialLink, uploadMaterial } from "../api/courses";
import { getUsers } from "../api/users";

export default function ManageCourse() {
  const { id } = useParams();
  const isNew = !id;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [facultyList, setFacultyList] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "beginner",
    durationHours: 0,
    facultyIds: [],
  });
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkType, setLinkType] = useState("link");
  const [file, setFile] = useState(null);
  const [fileTitle, setFileTitle] = useState("");
  const [fileType, setFileType] = useState("document");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role === "admin") {
      getUsers("faculty")
        .then((res) => setFacultyList(res.data || []))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (isNew) return;
    getCourse(id)
      .then((res) => {
        const c = res.data.course;
        setForm({
          title: c.title,
          description: c.description || "",
          level: c.level || "beginner",
          durationHours: c.durationHours || 0,
          facultyIds: (c.facultyIds || []).map((f) => String(f._id || f)),
        });
      })
      .catch(() => setError("Could not load course"));
  }, [id, isNew]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    try {
      if (isNew) {
        if (user.role !== "admin") {
          setError("Only admins create courses.");
          return;
        }
        await createCourse({
          ...form,
          facultyIds: form.facultyIds,
        });
        navigate("/");
      } else {
        const payload = {
          title: form.title,
          description: form.description,
          level: form.level,
          durationHours: form.durationHours,
        };
        if (user.role === "admin") payload.facultyIds = form.facultyIds;
        await updateCourse(id, payload);
        navigate(`/courses/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Save failed");
    }
  }

  async function handleAddLink(e) {
    e.preventDefault();
    if (!id) return;
    try {
      await addMaterialLink(id, {
        title: linkTitle,
        url: linkUrl,
        type: linkType,
      });
      setLinkTitle("");
      setLinkUrl("");
      const res = await getCourse(id);
      /* refresh handled by navigating - simple reload */
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!id || !file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", fileTitle || file.name);
    fd.append("type", fileType);
    try {
      await uploadMaterial(id, fd);
      setFile(null);
      setFileTitle("");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    }
  }

  function toggleFaculty(fid) {
    setForm((f) => {
      const set = new Set(f.facultyIds);
      if (set.has(fid)) set.delete(fid);
      else set.add(fid);
      return { ...f, facultyIds: [...set] };
    });
  }

  if (!isNew && error && !form.title) return <p className="error">{error}</p>;

  return (
    <div>
      <p>
        <Link to={isNew ? "/" : `/courses/${id}`}>← Back</Link>
      </p>
      <h1>{isNew ? "New course" : "Edit course"}</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSave} className="card" style={{ marginBottom: "1.5rem" }}>
        <label>Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <label style={{ marginTop: "0.75rem" }}>Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid2" style={{ marginTop: "0.75rem" }}>
          <div>
            <label>Level</label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label>Duration (hours)</label>
            <input
              type="number"
              min={0}
              value={form.durationHours}
              onChange={(e) =>
                setForm({ ...form, durationHours: Number(e.target.value) })
              }
            />
          </div>
        </div>
        {user?.role === "admin" && (
          <>
            <label style={{ marginTop: "0.75rem" }}>Assign faculty</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {facultyList.map((f) => (
                <label key={f._id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={form.facultyIds.includes(String(f._id))}
                    onChange={() => toggleFaculty(String(f._id))}
                  />
                  {f.name}
                </label>
              ))}
            </div>
          </>
        )}
        <button type="submit" style={{ marginTop: "1rem" }}>
          {isNew ? "Create course" : "Save changes"}
        </button>
      </form>

      {!isNew && (
        <>
          <h2>Add material (link)</h2>
          <form onSubmit={handleAddLink} className="card" style={{ marginBottom: "1rem" }}>
            <input
              placeholder="Title"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              required
            />
            <input
              placeholder="URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              required
              style={{ marginTop: "0.5rem" }}
            />
            <select
              value={linkType}
              onChange={(e) => setLinkType(e.target.value)}
              style={{ marginTop: "0.5rem" }}
            >
              <option value="link">Link</option>
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="presentation">Presentation</option>
            </select>
            <button type="submit" style={{ marginTop: "0.5rem" }}>
              Add link
            </button>
          </form>

          <h2>Upload file</h2>
          <form onSubmit={handleUpload} className="card">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <input
              placeholder="Title (optional)"
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              style={{ marginTop: "0.5rem" }}
            />
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              style={{ marginTop: "0.5rem" }}
            >
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="presentation">Presentation</option>
            </select>
            <button type="submit" style={{ marginTop: "0.5rem" }}>
              Upload
            </button>
          </form>
        </>
      )}
    </div>
  );
}
