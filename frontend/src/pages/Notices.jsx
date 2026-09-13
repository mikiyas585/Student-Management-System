import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Notices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const canManage = user.role === "admin" || user.role === "teacher";

  async function loadNotices() {
    try {
      const response = await api.get("/notices");
      setNotices(response.data.notices);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load notices.");
    }
  }

  useEffect(function () {
    loadNotices();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/notices", { title, content });
      setTitle("");
      setContent("");
      loadNotices();
    } catch (err) {
      setError(err.response?.data?.message || "Could not publish notice.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await api.delete("/notices/" + id);
      loadNotices();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  }

  return (
    <div className="container">
      {canManage && (
        <div className="card">
          <h2>Publish a notice</h2>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleCreate}>
            <label>Title</label>
            <input value={title} onChange={function (e) { setTitle(e.target.value); }} required />
            <label>Content</label>
            <textarea rows="3" value={content} onChange={function (e) { setContent(e.target.value); }} required />
            <button type="submit">Publish</button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>School Notices</h2>
        {notices.length === 0 && <p>No notices yet.</p>}
        {notices.map(function (n) {
          return (
            <div key={n.id} style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}>
              <h4 style={{ margin: "4px 0" }}>{n.title}</h4>
              <p style={{ margin: "4px 0" }}>{n.content}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                By {n.created_by_name} on {new Date(n.published_at).toLocaleDateString()}
              </p>
              {canManage && (
                <button className="danger" onClick={function () { handleDelete(n.id); }}>Delete</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
