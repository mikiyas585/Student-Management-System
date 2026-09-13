import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const canEdit = user.role === "admin" || user.role === "teacher";

  async function loadStudents() {
    try {
      const response = await api.get("/students");
      setStudents(response.data.students);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load students.");
    }
  }

  useEffect(function () {
    loadStudents();
  }, []);

  async function handleUpdate(id, grade, status) {
    setError("");
    setMessage("");
    try {
      await api.put("/students/" + id, { grade, status });
      setMessage("Student updated.");
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this student record?")) return;
    try {
      await api.delete("/students/" + id);
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Students</h2>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Grade</th><th>Status</th>
              {canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {students.map(function (s) {
              return (
                <StudentRow
                  key={s.id}
                  student={s}
                  canEdit={canEdit}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  isAdmin={user.role === "admin"}
                />
              );
            })}
          </tbody>
        </table>
        {students.length === 0 && <p>No student records to show.</p>}
      </div>
    </div>
  );
}

function StudentRow({ student, canEdit, onUpdate, onDelete, isAdmin }) {
  const [grade, setGrade] = useState(student.grade || "");
  const [status, setStatus] = useState(student.status);

  return (
    <tr>
      <td>{student.name}</td>
      <td>{student.email}</td>
      <td>
        {canEdit ? (
          <input value={grade} onChange={function (e) { setGrade(e.target.value); }} style={{ margin: 0 }} />
        ) : (
          student.grade || "-"
        )}
      </td>
      <td>
        {canEdit ? (
          <select value={status} onChange={function (e) { setStatus(e.target.value); }} style={{ margin: 0 }}>
            <option value="active">Active</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
          </select>
        ) : (
          <span className="badge">{student.status}</span>
        )}
      </td>
      {canEdit && (
        <td>
          <button onClick={function () { onUpdate(student.id, grade, status); }}>Save</button>{" "}
          {isAdmin && (
            <button className="danger" onClick={function () { onDelete(student.id); }}>Delete</button>
          )}
        </td>
      )}
    </tr>
  );
}
