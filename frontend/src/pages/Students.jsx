import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const canEdit = user.role === "admin" || user.role === "teacher";

  const grades = ["All", ...new Set(students.map(s => s.grade).filter(Boolean))];

  const filteredStudents = selectedGrade === "All" 
    ? students 
    : students.filter(s => s.grade === selectedGrade);

  async function loadData() {
    try {
      console.log("[Students] Loading students data...");
      const studentRes = await api.get("/students");
      console.log("[Students] Students loaded:", studentRes.data);
      setStudents(studentRes.data.data?.students || studentRes.data.students || []);

      if (canEdit) {
        console.log("[Students] Loading parents data...");
        const parentRes = await api.get("/students/parents");
        console.log("[Students] Parents loaded:", parentRes.data);
        setParents(parentRes.data.data?.parents || parentRes.data.parents || []);
      }
    } catch (err) {
      console.error("[Students] Error loading data:", err);
      setError(err.response?.data?.message || err.message || "Could not load records.");
    }
  }

  useEffect(function () {
    loadData();
  }, []);

  async function handleUpdate(id, grade, status, parentId) {
    setError("");
    setMessage("");
    try {
      await api.put("/students/" + id, { grade, status, parent_id: parentId });
      setMessage("Student record updated successfully.");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this student record?")) return;
    try {
      await api.delete("/students/" + id);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>{user.role === "parent" ? "My Child's Student Record" : "Student Directory & Parent Assignment"}</h2>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        
        {user.role !== "parent" && students.length > 0 && (
          <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ margin: 0 }}>Filter by Grade:</label>
            <select 
              value={selectedGrade} 
              onChange={e => setSelectedGrade(e.target.value)}
              style={{ width: "200px", margin: 0 }}
            >
              {grades.map(g => (
                <option key={g} value={g}>{g === "All" ? "All Grades" : g}</option>
              ))}
            </select>
          </div>
        )}

        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Email</th>
              <th>Grade</th>
              <th>Status</th>
              <th>Assigned Parent</th>
              {canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(function (s) {
              return (
                <StudentRow
                  key={s.id}
                  student={s}
                  parents={parents}
                  canEdit={canEdit}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  isAdmin={user.role === "admin"}
                />
              );
            })}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <p style={{ marginTop: 16 }}>
            {user.role === "parent"
              ? "No student is currently linked to your parent account. Please contact an admin to link your child."
              : "No student records found for the selected grade."}
          </p>
        )}
      </div>
    </div>
  );
}

function StudentRow({ student, parents, canEdit, onUpdate, onDelete, isAdmin }) {
  const isTeacher = !isAdmin && canEdit; // Teacher role
  const [grade, setGrade] = useState(student.grade || "");
  const [status, setStatus] = useState(student.status);
  const [parentId, setParentId] = useState(student.parent_id || "");

  useEffect(function () {
    setGrade(student.grade || "");
    setStatus(student.status);
    setParentId(student.parent_id || "");
  }, [student]);

  return (
    <tr>
      <td>
        <strong>{student.name}</strong>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{student.email}</div>
      </td>
      <td>
        {isTeacher ? (
          <input
            value={grade}
            onChange={function (e) { setGrade(e.target.value); }}
            placeholder="Grade"
            style={{ margin: 0, width: "90px" }}
          />
        ) : (
          student.grade || "-"
        )}
      </td>
      <td>
        {isTeacher ? (
          <select value={status} onChange={function (e) { setStatus(e.target.value); }} style={{ margin: 0 }}>
            <option value="active">Active</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
          </select>
        ) : (
          <span className="badge">{student.status}</span>
        )}
      </td>
      <td>
        {isAdmin ? (
          <select value={parentId} onChange={function (e) { setParentId(e.target.value); }} style={{ margin: 0 }}>
            <option value="">-- No Parent Linked --</option>
            {parents.map(function (p) {
              return (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.email})
                </option>
              );
            })}
          </select>
        ) : (
          student.parent_name ? (
            <span className="badge" style={{ background: "rgba(52, 211, 153, 0.2)", color: "#34d399" }}>
              👤 {student.parent_name}
            </span>
          ) : (
            <span style={{ opacity: 0.6 }}>Unassigned</span>
          )
        )}
      </td>
      {canEdit && (
        <td style={{ whiteSpace: "nowrap" }}>
          <div style={{ display: "flex", flexDirection: "row", gap: "8px", alignItems: "center", whiteSpace: "nowrap" }}>
            {isTeacher && (
              <button onClick={function () { onUpdate(student.id, grade, status, parentId); }}>Save Record</button>
            )}
            {isAdmin && (
              <>
                <button onClick={function () { onUpdate(student.id, grade, status, parentId); }}>Save Link</button>
                <button className="danger" onClick={function () { onDelete(student.id); }}>Delete</button>
              </>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}
