import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Attendance() {
  const { user } = useAuth();
  const canRecord = user.role === "teacher";
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("present");
  const [records, setRecords] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(function () {
    async function loadStudents() {
      try {
        console.log("[Attendance] Loading students...");
        const response = await api.get("/students");
        console.log("[Attendance] Students loaded:", response.data);
        const loadedStudents = response.data.data?.students || response.data.students || [];
        setStudents(loadedStudents);
        if (loadedStudents.length > 0) {
          setSelectedStudent(String(loadedStudents[0].id));
        }
      } catch (err) {
        console.error("[Attendance] Error loading students:", err);
        setError(err.response?.data?.message || err.message || "Could not load students.");
      }
    }
    loadStudents();
  }, []);

  async function loadAttendance(studentId) {
    if (!studentId) return;
    try {
      console.log("[Attendance] Loading attendance for student:", studentId);
      const response = await api.get("/attendance/" + studentId);
      console.log("[Attendance] Attendance loaded:", response.data);
      setRecords(response.data.attendance || []);
    } catch (err) {
      console.error("[Attendance] Error loading attendance:", err);
      setError(err.response?.data?.message || err.message || "Could not load attendance.");
    }
  }

  useEffect(function () {
    loadAttendance(selectedStudent);
  }, [selectedStudent]);

  const visibleStudents = students.filter(function (student) {
    return student.name.toLowerCase().includes(studentSearch.toLowerCase());
  });

  async function handleRecord(e) {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      await api.post("/attendance", { student_id: selectedStudent, date, status });
      setMessage("Attendance saved.");
      loadAttendance(selectedStudent);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save attendance.");
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Attendance</h2>
        {user.role === "admin" && (
          <p style={{ fontSize: 13, color: "var(--accent)", marginTop: 4, marginBottom: 12 }}>
            ℹ️ Read-Only Mode: Administrators can view attendance records, but only Teachers can record or edit daily attendance.
          </p>
        )}
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <label>Search Student by Name</label>
        <input
          type="search"
          value={studentSearch}
          onChange={function (e) { setStudentSearch(e.target.value); }}
          placeholder="Type a student name..."
        />

        <label>Student</label>
        <select value={selectedStudent} onChange={function (e) { setSelectedStudent(e.target.value); }}>
          {visibleStudents.map(function (s) {
            return <option key={s.id} value={s.id}>{s.name}</option>;
          })}
        </select>
        {students.length > 0 && visibleStudents.length === 0 && (
          <p style={{ fontSize: 13, opacity: 0.7 }}>No student matches that name.</p>
        )}

        {canRecord && (
          <form onSubmit={handleRecord}>
            <label>Date</label>
            <input type="date" value={date} onChange={function (e) { setDate(e.target.value); }} required />
            <label>Status</label>
            <select value={status} onChange={function (e) { setStatus(e.target.value); }}>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
            <button type="submit">Save attendance</button>
          </form>
        )}
      </div>

      <div className="card">
        <h3>History</h3>
        <table>
          <thead><tr><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {records.map(function (r) {
              return (
                <tr key={r.id}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td><span className="badge">{r.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {records.length === 0 && <p>No attendance recorded yet.</p>}
      </div>
    </div>
  );
}
