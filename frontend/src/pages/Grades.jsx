import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Grades() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Semester 1");
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [periodStatus, setPeriodStatus] = useState("closed");
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Teacher Form state
  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");

  // Admin changing status state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch grades and period status
      const gradesRes = await api.get("/grades?semester=" + encodeURIComponent(activeTab));
      setGrades(gradesRes.data.grades || []);
      setPeriodStatus(gradesRes.data.periodStatus || "closed");
      setIsPublished(Boolean(gradesRes.data.published));

      // 2. If teacher or admin, fetch student list for grading dropdown
      if (user.role === "admin" || user.role === "teacher") {
        const studentsRes = await api.get("/students");
        setStudents(studentsRes.data.students || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load grade board data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Admin status transition
  async function handleStatusChange(newStatus) {
    if (newStatus === "published") {
      const confirmPublish = window.confirm(
        `Are you sure you want to publish the Grade Board for ${activeTab}? Students and parents will immediately be able to view their results.`
      );
      if (!confirmPublish) return;
    }

    setUpdatingStatus(true);
    setError("");
    setMessage("");
    try {
      await api.put("/grades/period-status", {
        semester: activeTab,
        status: newStatus
      });
      setMessage(`Grade board for ${activeTab} is now ${newStatus.replace(/_/g, " ").toUpperCase()}.`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  // Teacher / Admin add grade
  async function handleAddGrade(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/grades", {
        student_id: studentId,
        subject,
        semester: activeTab,
        marks: parseInt(marks, 10)
      });
      setMessage("Grade record saved successfully.");
      setStudentId("");
      setSubject("");
      setMarks("");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not record grade.");
    }
  }

  // Delete grade
  async function handleDeleteGrade(id) {
    if (!window.confirm("Are you sure you want to delete this grade record?")) return;
    try {
      await api.delete(`/grades/${id}`);
      setMessage("Grade record deleted.");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete grade.");
    }
  }

  // Helper score badges
  function getScoreBadge(score) {
    if (score >= 90) return { label: "A (Excellent)", bg: "rgba(52, 211, 153, 0.2)", color: "#34d399" };
    if (score >= 80) return { label: "B (Good)", bg: "rgba(34, 211, 238, 0.2)", color: "#22d3ee" };
    if (score >= 70) return { label: "C (Satisfactory)", bg: "rgba(250, 204, 21, 0.2)", color: "#facc15" };
    if (score >= 60) return { label: "D (Pass)", bg: "rgba(251, 146, 60, 0.2)", color: "#fb923c" };
    return { label: "F (Needs Attention)", bg: "rgba(248, 113, 113, 0.2)", color: "#f87171" };
  }

  // Calculate statistics for published grades or admin view
  const totalEntries = grades.length;
  const avgMarks = totalEntries > 0 
    ? Math.round((grades.reduce((sum, g) => sum + Number(g.marks), 0) / totalEntries) * 10) / 10 
    : 0;

  return (
    <div className="container">
      {/* Page Header */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2>Academic Grades & Results</h2>
            <p style={{ marginTop: 4, color: "var(--text-secondary)" }}>
              {user.role === "admin" && "Manage grading period lifecycles, review faculty submissions, and publish finalized results."}
              {user.role === "teacher" && "Record subject marks when the administration opens the grade board for your department."}
              {user.role === "student" && "Official semester report card and academic transcript."}
              {user.role === "parent" && "Official semester academic performance and grades for your child."}
            </p>
          </div>

          {/* Current Period Status Indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Status:</span>
            {periodStatus === "closed" && (
              <span className="badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                Closed
              </span>
            )}
            {periodStatus === "open_for_teachers" && (
              <span className="badge" style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--accent)", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
                Open for Teachers (Drafting)
              </span>
            )}
            {periodStatus === "published" && (
              <span className="badge" style={{ background: "rgba(52, 211, 153, 0.15)", color: "#34d399", border: "1px solid rgba(52, 211, 153, 0.3)" }}>
                Published to Students & Parents
              </span>
            )}
          </div>
        </div>

        {/* Semester Tab Switcher */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {["Semester 1", "Semester 2"].map((sem) => (
            <button
              key={sem}
              className={activeTab === sem ? "" : "secondary"}
              onClick={() => setActiveTab(sem)}
              style={{ padding: "8px 18px", fontSize: 14 }}
            >
              {sem}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="card" style={{ borderLeft: "4px solid var(--danger)", background: "rgba(239, 68, 68, 0.08)", color: "#fca5a5" }}>{error}</div>}
      {message && <div className="card" style={{ borderLeft: "4px solid var(--success)", background: "rgba(34, 197, 94, 0.08)", color: "#86efac" }}>{message}</div>}

      {/* ============================================================ */}
      {/* 1. ADMIN LIFECYCLE MANAGEMENT CONTROL PANEL                  */}
      {/* ============================================================ */}
      {user.role === "admin" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 18, margin: 0 }}>Admin Workflow Controls ({activeTab})</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                Open the grade board for teachers to enter marks, review all faculty entries, and then publish finalized results to students and parents.
              </p>
            </div>

            {/* Action Workflow Buttons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {periodStatus !== "open_for_teachers" && (
                <button
                  onClick={() => handleStatusChange("open_for_teachers")}
                  disabled={updatingStatus}
                  className="secondary"
                >
                  Open for Teachers
                </button>
              )}

              {periodStatus !== "published" && (
                <button
                  onClick={() => handleStatusChange("published")}
                  disabled={updatingStatus}
                >
                  Publish to Students & Parents
                </button>
              )}

              {periodStatus !== "closed" && (
                <button
                  onClick={() => handleStatusChange("closed")}
                  disabled={updatingStatus}
                  className="secondary"
                  style={{ border: "1px solid rgba(239, 68, 68, 0.4)", color: "#f87171" }}
                >
                  🔒 Close / Lock Board
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar for Admin */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 20 }}>
            <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid var(--glass-border)" }}>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Recorded Grades</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{totalEntries}</div>
            </div>
            <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid var(--glass-border)" }}>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Average Class Score</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--cyan)", marginTop: 4 }}>
                {totalEntries > 0 ? `${avgMarks}%` : "N/A"}
              </div>
            </div>
            <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid var(--glass-border)" }}>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Visibility Status</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: periodStatus === "published" ? "#34d399" : "var(--accent)", marginTop: 8 }}>
                {periodStatus === "published" ? "✓ Live for Students/Parents" : "🔒 Hidden from Students/Parents"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. TEACHER RECORDING SECTION                                 */}
      {/* ============================================================ */}
      {user.role === "teacher" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>✍️ Record Student Grade ({activeTab})</h3>
            {periodStatus !== "open_for_teachers" ? (
              <span className="badge" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                🔒 Grading Locked by Administration
              </span>
            ) : (
              <span className="badge" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
                ✓ Grading Window Active
              </span>
            )}
          </div>

          {periodStatus !== "open_for_teachers" ? (
            <div style={{ padding: 18, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px dashed var(--glass-border)" }}>
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                The grade board for <strong>{activeTab}</strong> is currently {periodStatus === "published" ? "published" : "closed"}.
                Only when the school administrator opens the board can teachers enter or edit grades.
              </p>
            </div>
          ) : (
            <form onSubmit={handleAddGrade} style={{ display: "flex", gap: "15px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: "2 1 220px" }}>
                <label>Student</label>
                <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required style={{ margin: 0 }}>
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.grade || "No Grade Level"}) - {s.email}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: "2 1 200px" }}>
                <label>Your Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="e.g. Mathematics, Physics, English"
                  style={{ margin: 0 }}
                />
              </div>

              <div style={{ flex: "1 1 120px" }}>
                <label>Score (0-100)</label>
                <input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  required
                  min="0"
                  max="100"
                  placeholder="85"
                  style={{ margin: 0 }}
                />
              </div>

              <div>
                <button type="submit" style={{ height: "46px", padding: "0 24px" }}>
                  Save Grade Record
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. STUDENT & PARENT VIEW (UNPUBLISHED HOLDING BANNER)        */}
      {/* ============================================================ */}
      {(user.role === "student" || user.role === "parent") && !isPublished && (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
          <h3 style={{ fontSize: 20, color: "var(--accent)" }}>Grades for {activeTab} Are Under Review</h3>
          <p style={{ maxWidth: 560, margin: "12px auto 0", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Teachers and academic administration are currently compiling, checking, and reviewing subject results for this semester.
            Official report cards will be visible here once published by school administration.
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. GRADES TABLE (Visible to Admin, Teacher, or Published)    */}
      {/* ============================================================ */}
      {(user.role === "admin" || user.role === "teacher" || isPublished) && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>
              {user.role === "student" && `My Report Card: ${activeTab}`}
              {user.role === "parent" && `Student Performance: ${activeTab}`}
              {(user.role === "admin" || user.role === "teacher") && `${activeTab} Grade Records (${grades.length})`}
            </h3>

            {isPublished && (user.role === "student" || user.role === "parent") && totalEntries > 0 && (
              <div style={{ fontSize: 14 }}>
                Cumulative Average: <strong style={{ color: "var(--cyan)" }}>{avgMarks}%</strong>
              </div>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  {(user.role === "admin" || user.role === "teacher" || user.role === "parent") && <th>Student</th>}
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Grade Rating</th>
                  <th>Assigned Teacher</th>
                  <th>Date</th>
                  {(user.role === "admin" || (user.role === "teacher" && periodStatus === "open_for_teachers")) && (
                    <th>Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => {
                  const badge = getScoreBadge(g.marks);
                  return (
                    <tr key={g.id}>
                      {(user.role === "admin" || user.role === "teacher" || user.role === "parent") && (
                        <td>
                          <strong>{g.student_name}</strong>
                          {g.student_grade_level && (
                            <span style={{ fontSize: 12, color: "var(--text-secondary)", marginLeft: 6 }}>
                              ({g.student_grade_level})
                            </span>
                          )}
                        </td>
                      )}
                      <td><strong>{g.subject}</strong></td>
                      <td>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                          {g.marks}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}> / 100</span>
                      </td>
                      <td>
                        <span className="badge" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.color}40` }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{g.teacher_name}</td>
                      <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        {new Date(g.created_at).toLocaleDateString()}
                      </td>
                      {(user.role === "admin" || (user.role === "teacher" && periodStatus === "open_for_teachers")) && (
                        <td>
                          <button
                            onClick={() => handleDeleteGrade(g.id)}
                            className="secondary"
                            style={{ padding: "4px 10px", fontSize: 12, color: "#f87171" }}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {grades.length === 0 && !loading && (
            <p style={{ marginTop: "20px", color: "var(--text-secondary)", textAlign: "center" }}>
              No grades recorded for {activeTab}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
