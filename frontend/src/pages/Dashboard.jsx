import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import TeacherManagementBoard from "../components/TeacherManagementBoard";

export default function Dashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Admin Quick Notice state
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeMsg, setNoticeMsg] = useState("");

  // Admin Quick Search for student link manager
  const [searchQuery, setSearchQuery] = useState("");

  // Attendance viewer state for admin
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceSearch, setAttendanceSearch] = useState("");

  async function loadAllData() {
    setLoading(true);
    try {
      const studentRes = await api.get("/students");
      const loadedStudents = studentRes.data.data?.students || studentRes.data.students || [];
      setStudents(loadedStudents);

      if (loadedStudents.length > 0 && !selectedStudentId) {
        setSelectedStudentId(String(loadedStudents[0].id));
      }

      if (user.role === "admin" || user.role === "teacher") {
        const parentRes = await api.get("/students/parents");
        setParents(parentRes.data.data?.parents || parentRes.data.parents || []);

        const noticeRes = await api.get("/notices");
        setNotices(noticeRes.data.notices || []);
      }

      if (user.role === "admin" || user.role === "student") {
        const [subRes, recRes] = await Promise.all([
          api.get("/subscriptions"),
          api.get("/subscriptions/my"),
        ]);
        setSubscriptions(subRes.data.subscriptions || []);
        setRecords(recRes.data.records || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    loadAllData();
  }, [user]);

  // Load attendance when admin selects a student
  useEffect(function () {
    async function fetchAttendance() {
      if (!selectedStudentId) return;
      try {
        const res = await api.get("/attendance/" + selectedStudentId);
        setAttendanceRecords(res.data.attendance || []);
      } catch (err) {
        console.error("Attendance fetch error:", err);
      }
    }
    if (user.role === "admin") {
      fetchAttendance();
    }
  }, [selectedStudentId, user]);

  async function handleQuickLink(studentId, parentId) {
    setMessage("");
    setError("");
    try {
      await api.put("/students/" + studentId, { parent_id: parentId });
      setMessage("Parent-student association updated successfully.");
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update parent link.");
    }
  }

  async function handleCreateNotice(e) {
    e.preventDefault();
    setNoticeMsg("");
    try {
      await api.post("/notices", { title: noticeTitle, content: noticeContent });
      setNoticeTitle("");
      setNoticeContent("");
      setNoticeMsg("Announcement published!");
      loadAllData();
    } catch (err) {
      setNoticeMsg("Could not publish notice.");
    }
  }

  async function handleDeleteNotice(id) {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await api.delete("/notices/" + id);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  }

  // Analytics Calculations for Admin
  const totalRevenue = records.reduce(function (sum, r) {
    return sum + Number(r.amount_paid || 0);
  }, 0);

  const activeStudentsCount = students.filter(function (s) { return s.status === "active"; }).length;
  const linkedStudentsCount = students.filter(function (s) { return Boolean(s.parent_id); }).length;
  const filteredStudents = students.filter(function (s) {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.parent_name && s.parent_name.toLowerCase().includes(q));
  });
  const attendanceStudents = students.filter(function (s) {
    return s.name.toLowerCase().includes(attendanceSearch.toLowerCase());
  });

  return (
    <div className="container">
      {/* Hero Welcome Header */}
      <div className="card" style={{ background: "linear-gradient(135deg, rgba(250, 204, 21, 0.08), rgba(34, 211, 238, 0.05))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2>Welcome back, {user.name} 👋</h2>
            <p style={{ marginTop: 4 }}>
              System Role: <span className="badge" style={{ background: "var(--accent)", color: "#000", fontWeight: 700 }}>{user.role.toUpperCase()}</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link to="/students" className="btn" style={{ fontSize: 13 }}>📚 Directory</Link>
            <Link to="/notices" className="btn" style={{ fontSize: 13, background: "rgba(255,255,255,0.1)" }}>📢 Notices</Link>
            <Link to="/subscriptions" className="btn" style={{ fontSize: 13, background: "rgba(255,255,255,0.1)" }}>💳 Subscriptions</Link>
            <Link to="/attendance" className="btn" style={{ fontSize: 13, background: "rgba(255,255,255,0.1)" }}>📅 Attendance</Link>
          </div>
        </div>
      </div>

      {/* ADMIN DASHBOARD OVERVIEW */}
      {user.role === "admin" && (
        <>
          {/* Executive Analytics Metrics Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ margin: 0, padding: 20 }}>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Total Students</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "4px 0" }}>{students.length}</div>
              <div style={{ fontSize: 12, color: "#34d399" }}>{activeStudentsCount} Active | {linkedStudentsCount} Linked</div>
            </div>

            <div className="card" style={{ margin: 0, padding: 20 }}>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Parent Accounts</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", margin: "4px 0" }}>{parents.length}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Registered Parents</div>
            </div>

            <div className="card" style={{ margin: 0, padding: 20 }}>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Published Notices</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--cyan)", margin: "4px 0" }}>{notices.length}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>School Announcements</div>
            </div>

            <div className="card" style={{ margin: 0, padding: 20 }}>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Fee Revenue Collected</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#34d399", margin: "4px 0" }}>${totalRevenue.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{records.length} Paid Subscriptions</div>
            </div>
          </div>

          {/* Module 1: Parent & Student Link Manager */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2>🔗 Parent & Student Link Manager</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  Assign parents to students. Assigned parents can only view their own child's grades and attendance.
                </p>
              </div>
              <input
                type="text"
                placeholder="Search student or parent..."
                value={searchQuery}
                onChange={function (e) { setSearchQuery(e.target.value); }}
                style={{ width: "240px", margin: 0, fontSize: 13, padding: "8px 12px" }}
              />
            </div>

            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}

            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th>Assigned Parent</th>
                  <th>Action / Link Parent</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(function (s) {
                  return (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.name}</strong>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>{s.email}</div>
                      </td>
                      <td>{s.grade || "-"}</td>
                      <td><span className="badge">{s.status}</span></td>
                      <td>
                        {s.parent_name ? (
                          <span className="badge" style={{ background: "rgba(52, 211, 153, 0.2)", color: "#34d399" }}>
                            👤 {s.parent_name}
                          </span>
                        ) : (
                          <span style={{ opacity: 0.5, fontSize: 12 }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        <select
                          value={s.parent_id || ""}
                          onChange={function (e) {
                            handleQuickLink(s.id, e.target.value);
                          }}
                          style={{ margin: 0, padding: "6px 10px", fontSize: 13 }}
                        >
                          <option value="">-- No Parent (Unlink) --</option>
                          {parents.map(function (p) {
                            return (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.email})
                              </option>
                            );
                          })}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredStudents.length === 0 && <p style={{ marginTop: 12 }}>No matching student records found.</p>}
          </div>

          {/* Grid Layout for Notices & Attendance Monitor */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20 }}>
            {/* Module 2: Quick Notice Publisher */}
            <div className="card" style={{ margin: 0 }}>
              <h2>📢 Quick Announcement Publisher</h2>
              {noticeMsg && <p className="success">{noticeMsg}</p>}
              <form onSubmit={handleCreateNotice} style={{ marginTop: 12 }}>
                <label>Title</label>
                <input
                  value={noticeTitle}
                  onChange={function (e) { setNoticeTitle(e.target.value); }}
                  placeholder="e.g. Midterm Exam Schedule"
                  required
                />
                <label>Content</label>
                <textarea
                  value={noticeContent}
                  onChange={function (e) { setNoticeContent(e.target.value); }}
                  placeholder="Details about the announcement..."
                  rows={3}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "#fff" }}
                />
                <button type="submit" style={{ marginTop: 12 }}>Publish Notice</button>
              </form>

              <h4 style={{ marginTop: 20, marginBottom: 10 }}>Recent Published Notices ({notices.length})</h4>
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {notices.map(function (n) {
                  return (
                    <div key={n.id} style={{ padding: "8px 12px", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>{n.title}</strong>
                        <div style={{ fontSize: 11, opacity: 0.6 }}>By {n.created_by_name} • {new Date(n.published_at).toLocaleDateString()}</div>
                      </div>
                      <button className="danger" onClick={function () { handleDeleteNotice(n.id); }} style={{ padding: "4px 8px", fontSize: 12 }}>Delete</button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Module 3: Attendance Monitor (Read-Only) */}
            <div className="card" style={{ margin: 0 }}>
              <h2>📅 Attendance Overview (Read-Only)</h2>
              <p style={{ fontSize: 13, color: "var(--accent)", marginBottom: 12 }}>
                ℹ️ Note: Admins can inspect attendance. Daily recording is restricted to Teachers.
              </p>

              <label>Select Student</label>
              <input
                type="search"
                value={attendanceSearch}
                onChange={function (e) { setAttendanceSearch(e.target.value); }}
                placeholder="Search student by name..."
                style={{ marginBottom: 8 }}
              />
              <select
                value={selectedStudentId}
                onChange={function (e) { setSelectedStudentId(e.target.value); }}
                style={{ marginBottom: 16 }}
              >
                {attendanceStudents.map(function (s) {
                  return <option key={s.id} value={s.id}>{s.name} ({s.grade || "No Grade"})</option>;
                })}
              </select>
              {students.length > 0 && attendanceStudents.length === 0 && (
                <p style={{ fontSize: 13, opacity: 0.7 }}>No student matches that name.</p>
              )}

              <table>
                <thead>
                  <tr><th>Date</th><th>Attendance Status</th></tr>
                </thead>
                <tbody>
                  {attendanceRecords.map(function (r) {
                    return (
                      <tr key={r.id}>
                        <td>{new Date(r.date).toLocaleDateString()}</td>
                        <td><span className="badge">{r.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {attendanceRecords.length === 0 && <p style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>No attendance recorded for this student yet.</p>}
            </div>
          </div>
          
          {/* Teacher Management Board */}
          <div className="card" style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2>👨‍🏫 Teacher Management Board</h2>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Manage teachers, assignments, and student links
              </div>
            </div>
            <TeacherManagementBoard />
          </div>
        </>
      )}

      {/* TEACHER DASHBOARD OVERVIEW */}
      {user.role === "teacher" && (
        <div className="card">
          <h2>👨‍🏫 Teacher Overview</h2>
          <p>You can view students, record daily attendance, and publish school notices.</p>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <Link to="/attendance" className="btn">📅 Record Attendance</Link>
            <Link to="/notices" className="btn" style={{ background: "rgba(255,255,255,0.1)" }}>📢 Post Notice</Link>
          </div>
        </div>
      )}

      {/* STUDENT DASHBOARD OVERVIEW */}
      {user.role === "student" && (
        <div className="card">
          <h2>🎓 Student Portal Overview</h2>
          <p>Track your student record, view your attendance history, and manage fee subscriptions.</p>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <Link to="/attendance" className="btn">📅 My Attendance</Link>
            <Link to="/subscriptions" className="btn" style={{ background: "rgba(255,255,255,0.1)" }}>💳 Subscriptions</Link>
          </div>
        </div>
      )}

      {/* PARENT DASHBOARD OVERVIEW */}
      {user.role === "parent" && (
        <div className="card">
          <h2>👨‍👩‍👧 My Child's Academic Summary</h2>
          {students.length === 0 ? (
            <div style={{ marginTop: 12, padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
              <p>⚠️ <strong>No student is currently linked to your parent account.</strong></p>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>
                Please ask your school administrator to link your child's student record to your account (Email: {user.email}).
              </p>
            </div>
          ) : (
            students.map(function (child) {
              return (
                <div key={child.id} style={{ marginTop: 16, padding: 16, border: "1px solid var(--glass-border)", borderRadius: 12, background: "var(--surface)" }}>
                  <h3 style={{ fontSize: 18, color: "var(--accent)" }}>{child.name}</h3>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>Email: {child.email}</p>
                  <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                    <div>Grade: <strong>{child.grade || "N/A"}</strong></div>
                    <div>Status: <span className="badge">{child.status}</span></div>
                  </div>
                  <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                    <Link to="/attendance" className="btn" style={{ fontSize: 13 }}>
                      📅 View Attendance
                    </Link>
                    <Link to="/notices" className="btn" style={{ fontSize: 13, background: "rgba(255,255,255,0.1)" }}>
                      📢 School Notices
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
