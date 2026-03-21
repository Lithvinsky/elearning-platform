import { useState, useEffect } from "react";
import useAuth from "../auth/useAuth";
import { updateProfile } from "../api/auth";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    department: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      department: user.department || "",
      phone: user.phone || "",
      bio: user.bio || "",
    });
  }, [user]);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    try {
      await updateProfile(form);
      await refreshUser();
      setMsg("Profile saved.");
    } catch {
      setMsg("Could not save.");
    }
  }

  return (
    <div>
      <h1>Profile & settings</h1>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 480 }}>
        <label>Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <label style={{ marginTop: "0.75rem" }}>Department</label>
        <input
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />
        <label style={{ marginTop: "0.75rem" }}>Phone</label>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <label style={{ marginTop: "0.75rem" }}>Bio</label>
        <textarea
          rows={4}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
        <button type="submit" style={{ marginTop: "1rem" }}>
          Save
        </button>
        {msg && <p style={{ marginTop: "0.5rem" }}>{msg}</p>}
      </form>
    </div>
  );
}
