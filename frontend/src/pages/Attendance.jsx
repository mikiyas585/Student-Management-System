import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Attendance() {
  const { user } = useAuth();
  const canRecord = user.role === "teacher" || user.role === "admin";
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("present");
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(function () {
    async function loadStudents() {
      try {
        const response = await api.get("/students");
        setStudents(response.data.students);
        if (response.data.students.length > 0) {
          setSelectedStudent(String(response.data.students[0].id));
        }
      } catch (err) {
        setError(err.response?.data?.message || "Could not load students.");
      }
    }
    loadStudents();
  }, []);

  async function loadAttendance(studentId) {
    if (!studentId) return;
    try {
      const response = await api.get("/attendance/" + studentId);
      setRecords(response.data.attendance);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load attendance.");
    }
  }

  useEffect(function () {
    loadAttendance(selectedStudent);
  }, [selectedStudent]);

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
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <label>Student</label>
        <select value={selectedStudent} onChange={function (e) { setSelectedStudent(e.target.value); }}>
          {students.map(function (s) {
            return <option key={s.id} value={s.id}>{s.name}</option>;
          })}
        </select>

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
