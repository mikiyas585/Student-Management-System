import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Teachers() {
  // Main data states
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  
  // UI states
  const [activeTab, setActiveTab] = useState("teachers");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  // Form states
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showLinkStudentForm, setShowLinkStudentForm] = useState(false);
  
  // Form data
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    password: "",
    qualifications: "",
    specialization: "",
    years_of_experience: 0
  });
  
  const [assignmentForm, setAssignmentForm] = useState({
    teacher_id: "",
    grade_id: "",
    subject_id: "",
    section_id: "",
    academic_year: new Date().getFullYear()
  });
  
  const [linkForm, setLinkForm] = useState({
    teacher_assignment_id: "",
    student_id: ""
  });

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    setError("");
    try {
      console.log("[Teachers] Loading all data...");
      
      // Load all data in parallel
      const [teachersRes, assignmentsRes, gradesRes, subjectsRes, sectionsRes] = await Promise.all([
        api.get("/teachers"),
        api.get("/teachers/assignments/all"),
        api.get("/teachers/grades/all"),
        api.get("/teachers/subjects/all"),
        api.get("/teachers/sections/all")
      ]);

      console.log("[Teachers] Data loaded:", {
        teachers: teachersRes.data.teachers?.length || 0,
        assignments: assignmentsRes.data.assignments?.length || 0,
        grades: gradesRes.data.grades?.length || 0,
        subjects: subjectsRes.data.subjects?.length || 0,
        sections: sectionsRes.data.sections?.length || 0
      });

      setTeachers(teachersRes.data.teachers || []);
      setAssignments(assignmentsRes.data.assignments || []);
      setGrades(gradesRes.data.grades || []);
      setSubjects(subjectsRes.data.subjects || []);
      setSections(sectionsRes.data.sections || []);
    } catch (err) {
      console.error("[Teachers] Error loading data:", err);
      const errorMsg = err.response?.data?.message || err.message || "Could not load data. Please check your connection.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  // Teacher CRUD operations
  async function handleCreateTeacher(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    
    try {
      await api.post("/teachers", teacherForm);
      setMessage("Teacher created successfully!");
      setShowTeacherForm(false);
      setTeacherForm({
        name: "",
        email: "",
        password: "",
        qualifications: "",
        specialization: "",
        years_of_experience: 0
      });
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create teacher.");
    }
  }

  async function handleUpdateTeacher(id, updates) {
    setError("");
    setMessage("");
    
    try {
      await api.put(`/teachers/${id}`, updates);
      setMessage("Teacher updated successfully!");
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update teacher.");
    }
  }

  async function handleDeleteTeacher(id) {
    if (!window.confirm("Are you sure you want to delete this teacher? This will also remove their user account.")) {
      return;
    }
    
    try {
      await api.delete(`/teachers/${id}`);
      setMessage("Teacher deleted successfully!");
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete teacher.");
    }
  }

  // Assignment CRUD operations
  async function handleCreateAssignment(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    
    try {
      await api.post("/teachers/assignments", assignmentForm);
      setMessage("Assignment created successfully!");
      setShowAssignmentForm(false);
      setAssignmentForm({
        teacher_id: "",
        grade_id: "",
        subject_id: "",
        section_id: "",
        academic_year: new Date().getFullYear()
      });
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create assignment.");
    }
  }

  async function handleUpdateAssignment(id, is_active) {
    setError("");
    setMessage("");
    
    try {
      await api.put(`/teachers/assignments/${id}`, { is_active });
      setMessage("Assignment updated successfully!");
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update assignment.");
    }
  }

  async function handleDeleteAssignment(id) {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }
    
    try {
      await api.delete(`/teachers/assignments/${id}`);
      setMessage("Assignment deleted successfully!");
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete assignment.");
    }
  }

  // State for available students
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Load available students for linking
  async function loadAvailableStudents(assignmentId) {
    if (!assignmentId) {
      setAvailableStudents([]);
      return;
    }
    
    setLoadingStudents(true);
    try {
      // Find the assignment to get grade_id
      const assignment = assignments.find(a => a.assignment_id == assignmentId);
      if (assignment) {
        const response = await api.get(`/teachers/students/available?grade_id=${assignment.grade_id}`);
        setAvailableStudents(response.data.students || []);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
      setAvailableStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }

  // Student linking operations
  async function handleLinkStudent(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    
    try {
      await api.post("/teachers/link-student", linkForm);
      setMessage("Student linked successfully!");
      setShowLinkStudentForm(false);
      setLinkForm({
        teacher_assignment_id: "",
        student_id: ""
      });
      setAvailableStudents([]);
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to link student.");
    }
  }

  async function handleUnlinkStudent(linkId) {
    if (!window.confirm("Are you sure you want to unlink this student?")) {
      return;
    }
    
    try {
      await api.delete(`/teachers/link-student/${linkId}`);
      setMessage("Student unlinked successfully!");
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to unlink student.");
    }
  }

  // Get filtered sections based on selected grade
  const getSectionsForGrade = (gradeId) => {
    return sections.filter(section => section.grade_id == gradeId);
  };

  // Get assignments for a specific teacher
  const getAssignmentsForTeacher = (teacherId) => {
    return assignments.filter(assignment => assignment.teacher_id == teacherId);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h2>Teacher Management</h2>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="loading-spinner" style={{ margin: "0 auto 20px" }} />
            <p>Loading teacher management data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Teacher Management Board</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Manage teachers, their assignments to grades/subjects/sections, and link students to teachers.
        </p>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        {/* Tabs Navigation */}
        <div className="tabs" style={{ marginBottom: "24px" }}>
          <button 
            className={activeTab === "teachers" ? "active" : ""}
            onClick={() => setActiveTab("teachers")}
          >
            👨‍🏫 Teachers ({teachers.length})
          </button>
          <button 
            className={activeTab === "assignments" ? "active" : ""}
            onClick={() => setActiveTab("assignments")}
          >
            📚 Assignments ({assignments.length})
          </button>
          <button 
            className={activeTab === "grades" ? "active" : ""}
            onClick={() => setActiveTab("grades")}
          >
            📊 Grades & Subjects
          </button>
        </div>

        {/* Teachers Tab */}
        {activeTab === "teachers" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3>All Teachers</h3>
              <button 
                className="clay-btn clay-btn-teal"
                onClick={() => setShowTeacherForm(!showTeacherForm)}
              >
                {showTeacherForm ? "Cancel" : "+ Add New Teacher"}
              </button>
            </div>

            {/* Add Teacher Form */}
            {showTeacherForm && (
              <div className="clay-card" style={{ marginBottom: "24px", padding: "24px" }}>
                <h4>Create New Teacher</h4>
                <form onSubmit={handleCreateTeacher}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label>Full Name *</label>
                      <input
                        type="text"
                        required
                        value={teacherForm.name}
                        onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label>Email *</label>
                      <input
                        type="email"
                        required
                        value={teacherForm.email}
                        onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                        placeholder="teacher@school.edu"
                      />
                    </div>
                    <div>
                      <label>Password *</label>
                      <input
                        type="password"
                        required
                        value={teacherForm.password}
                        onChange={(e) => setTeacherForm({...teacherForm, password: e.target.value})}
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label>Qualifications</label>
                      <input
                        type="text"
                        value={teacherForm.qualifications}
                        onChange={(e) => setTeacherForm({...teacherForm, qualifications: e.target.value})}
                        placeholder="M.Ed, B.Sc, etc."
                      />
                    </div>
                    <div>
                      <label>Specialization</label>
                      <input
                        type="text"
                        value={teacherForm.specialization}
                        onChange={(e) => setTeacherForm({...teacherForm, specialization: e.target.value})}
                        placeholder="Mathematics, Science, etc."
                      />
                    </div>
                    <div>
                      <label>Years of Experience</label>
                      <input
                        type="number"
                        min="0"
                        value={teacherForm.years_of_experience}
                        onChange={(e) => setTeacherForm({...teacherForm, years_of_experience: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button type="submit" className="clay-btn clay-btn-coral">Create Teacher</button>
                    <button type="button" className="secondary" onClick={() => setShowTeacherForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Teachers List */}
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Contact</th>
                    <th>Qualifications</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Assignments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                        <p>No teachers found. Add your first teacher above.</p>
                      </td>
                    </tr>
                  ) : (
                    teachers.map(teacher => (
                      <TeacherRow
                        key={teacher.teacher_id}
                        teacher={teacher}
                        assignments={getAssignmentsForTeacher(teacher.teacher_id)}
                        onUpdate={handleUpdateTeacher}
                        onDelete={handleDeleteTeacher}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3>Teacher Assignments</h3>
              <button 
                className="clay-btn clay-btn-teal"
                onClick={() => setShowAssignmentForm(!showAssignmentForm)}
              >
                {showAssignmentForm ? "Cancel" : "+ Create Assignment"}
              </button>
            </div>

            {/* Create Assignment Form */}
            {showAssignmentForm && (
              <div className="clay-card" style={{ marginBottom: "24px", padding: "24px" }}>
                <h4>Assign Teacher to Grade/Subject/Section</h4>
                <form onSubmit={handleCreateAssignment}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label>Teacher *</label>
                      <select
                        required
                        value={assignmentForm.teacher_id}
                        onChange={(e) => setAssignmentForm({...assignmentForm, teacher_id: e.target.value})}
                      >
                        <option value="">Select Teacher</option>
                        {teachers.map(teacher => (
                          <option key={teacher.teacher_id} value={teacher.teacher_id}>
                            {teacher.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label>Academic Year *</label>
                      <input
                        type="number"
                        required
                        min="2000"
                        max="2100"
                        value={assignmentForm.academic_year}
                        onChange={(e) => setAssignmentForm({...assignmentForm, academic_year: e.target.value})}
                      />
                    </div>
                    <div>
                      <label>Grade *</label>
                      <select
                        required
                        value={assignmentForm.grade_id}
                        onChange={(e) => {
                          setAssignmentForm({
                            ...assignmentForm, 
                            grade_id: e.target.value,
                            section_id: "" // Reset section when grade changes
                          });
                        }}
                      >
                        <option value="">Select Grade</option>
                        {grades.map(grade => (
                          <option key={grade.id} value={grade.id}>
                            {grade.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label>Subject *</label>
                      <select
                        required
                        value={assignmentForm.subject_id}
                        onChange={(e) => setAssignmentForm({...assignmentForm, subject_id: e.target.value})}
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label>Section *</label>
                      <select
                        required
                        value={assignmentForm.section_id}
                        onChange={(e) => setAssignmentForm({...assignmentForm, section_id: e.target.value})}
                        disabled={!assignmentForm.grade_id}
                      >
                        <option value="">{assignmentForm.grade_id ? "Select Section" : "Select grade first"}</option>
                        {getSectionsForGrade(assignmentForm.grade_id).map(section => (
                          <option key={section.id} value={section.id}>
                            {section.name} ({section.grade_name})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button type="submit" className="clay-btn clay-btn-coral">Create Assignment</button>
                    <button type="button" className="secondary" onClick={() => setShowAssignmentForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Link Student Form */}
            {showLinkStudentForm && (
              <div className="clay-card" style={{ marginBottom: "24px", padding: "24px" }}>
                <h4>Link Student to Teacher Assignment</h4>
                <form onSubmit={handleLinkStudent}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label>Teacher Assignment *</label>
                      <select
                        required
                        value={linkForm.teacher_assignment_id}
                        onChange={(e) => {
                          setLinkForm({
                            ...linkForm, 
                            teacher_assignment_id: e.target.value,
                            student_id: "" // Reset student when assignment changes
                          });
                          loadAvailableStudents(e.target.value);
                        }}
                      >
                        <option value="">Select Assignment</option>
                        {assignments.map(assignment => (
                          <option key={assignment.assignment_id} value={assignment.assignment_id}>
                            {assignment.teacher_name} - {assignment.grade_name} {assignment.section_name} ({assignment.subject_name})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label>Student *</label>
                      <select
                        required
                        value={linkForm.student_id}
                        onChange={(e) => setLinkForm({...linkForm, student_id: e.target.value})}
                        disabled={loadingStudents || availableStudents.length === 0}
                      >
                        <option value="">
                          {loadingStudents ? "Loading students..." : 
                           availableStudents.length === 0 ? "No students available for this grade" : 
                           "Select Student"}
                        </option>
                        {availableStudents.map(student => (
                          <option key={student.student_id} value={student.student_id}>
                            {student.name} - Grade {student.grade}
                          </option>
                        ))}
                      </select>
                      {availableStudents.length > 0 && (
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                          {availableStudents.length} students available for this grade
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button type="submit" className="clay-btn clay-btn-coral">Link Student</button>
                    <button type="button" className="secondary" onClick={() => setShowLinkStudentForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Assignments List */}
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Grade</th>
                    <th>Subject</th>
                    <th>Section</th>
                    <th>Academic Year</th>
                    <th>Status</th>
                    <th>Assigned By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                        <p>No assignments found. Create your first assignment above.</p>
                      </td>
                    </tr>
                  ) : (
                    assignments.map(assignment => (
                      <AssignmentRow
                        key={assignment.assignment_id}
                        assignment={assignment}
                        onUpdate={handleUpdateAssignment}
                        onDelete={handleDeleteAssignment}
                        onLinkStudent={() => {
                          setLinkForm({...linkForm, teacher_assignment_id: assignment.assignment_id});
                          setShowLinkStudentForm(true);
                        }}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grades & Subjects Tab */}
        {activeTab === "grades" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* Grades Panel */}
              <div className="clay-card">
                <h3>📊 Grade Levels</h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                  All available grade levels in the system
                </p>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Grade</th>
                        <th>Description</th>
                        <th>Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map(grade => (
                        <tr key={grade.id}>
                          <td><strong>{grade.name}</strong></td>
                          <td>{grade.description || "-"}</td>
                          <td>{grade.order_index}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Subjects Panel */}
              <div className="clay-card">
                <h3>📚 Subjects</h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                  All available subjects in the curriculum
                </p>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Code</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map(subject => (
                        <tr key={subject.id}>
                          <td><strong>{subject.name}</strong></td>
                          <td><span className="badge">{subject.code}</span></td>
                          <td>{subject.description || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sections Panel */}
            <div className="clay-card" style={{ marginTop: "24px" }}>
              <h3>🏫 Sections by Grade</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                All sections organized by grade level
              </p>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Section</th>
                      <th>Grade</th>
                      <th>Capacity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map(section => (
                      <tr key={section.id}>
                        <td><strong>{section.name}</strong></td>
                        <td>{section.grade_name}</td>
                        <td>{section.capacity} students</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Teacher Row Component
function TeacherRow({ teacher, assignments, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    qualifications: teacher.qualifications || "",
    specialization: teacher.specialization || "",
    years_of_experience: teacher.years_of_experience || 0
  });

  const handleSave = () => {
    onUpdate(teacher.teacher_id, formData);
    setIsEditing(false);
  };

  return (
    <tr>
      <td>
        <strong>{teacher.name}</strong>
        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{teacher.email}</div>
      </td>
      <td>
        <div style={{ fontSize: "14px" }}>{teacher.email}</div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          Joined: {new Date(teacher.user_created_at).toLocaleDateString()}
        </div>
      </td>
      <td>
        {isEditing ? (
          <input
            type="text"
            value={formData.qualifications}
            onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
            placeholder="Qualifications"
            style={{ width: "100%" }}
          />
        ) : (
          teacher.qualifications || <span style={{ opacity: 0.6 }}>Not specified</span>
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="text"
            value={formData.specialization}
            onChange={(e) => setFormData({...formData, specialization: e.target.value})}
            placeholder="Specialization"
            style={{ width: "100%" }}
          />
        ) : (
          teacher.specialization || <span style={{ opacity: 0.6 }}>Not specified</span>
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="number"
            min="0"
            value={formData.years_of_experience}
            onChange={(e) => setFormData({...formData, years_of_experience: parseInt(e.target.value) || 0})}
            style={{ width: "80px" }}
          />
        ) : (
          `${teacher.years_of_experience || 0} years`
        )}
      </td>
      <td>
        {assignments.length > 0 ? (
          <div>
            {assignments.slice(0, 2).map(assignment => (
              <div key={assignment.assignment_id} style={{ fontSize: "12px", marginBottom: "4px" }}>
                <span className="badge">{assignment.grade_name} {assignment.section_name}</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}> {assignment.subject_name}</span>
              </div>
            ))}
            {assignments.length > 2 && (
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                +{assignments.length - 2} more assignments
              </div>
            )}
          </div>
        ) : (
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
            No assignments
          </span>
        )}
      </td>
      <td style={{ whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {isEditing ? (
            <>
              <button onClick={handleSave} style={{ padding: "6px 12px", fontSize: "12px" }}>Save</button>
              <button className="secondary" onClick={() => setIsEditing(false)} style={{ padding: "6px 12px", fontSize: "12px" }}>Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} style={{ padding: "6px 12px", fontSize: "12px" }}>Edit</button>
              <button 
                className="danger" 
                onClick={() => onDelete(teacher.teacher_id)}
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// Assignment Row Component
function AssignmentRow({ assignment, onUpdate, onDelete, onLinkStudent }) {
  const [isActive, setIsActive] = useState(assignment.is_active);

  const handleToggleActive = () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    onUpdate(assignment.assignment_id, newStatus ? 1 : 0);
  };

  return (
    <tr>
      <td>
        <strong>{assignment.teacher_name}</strong>
      </td>
      <td>
        <span className="badge">{assignment.grade_name}</span>
      </td>
      <td>{assignment.subject_name}</td>
      <td>{assignment.section_name}</td>
      <td>
        <strong>{assignment.academic_year}</strong>
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          {new Date(assignment.assigned_at).toLocaleDateString()}
        </div>
      </td>
      <td>
        <span 
          className="badge" 
          style={{ 
            background: isActive ? "rgba(6, 214, 160, 0.2)" : "rgba(251, 113, 133, 0.2)",
            color: isActive ? "#06d6a0" : "#fb7185"
          }}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td>
        <div style={{ fontSize: "12px" }}>{assignment.assigned_by_name}</div>
      </td>
      <td style={{ whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button 
            onClick={handleToggleActive}
            style={{ padding: "6px 12px", fontSize: "12px" }}
          >
            {isActive ? "Deactivate" : "Activate"}
          </button>
          <button 
            className="secondary"
            onClick={onLinkStudent}
            style={{ padding: "6px 12px", fontSize: "12px" }}
          >
            Link Student
          </button>
          <button 
            className="danger"
            onClick={() => onDelete(assignment.assignment_id)}
            style={{ padding: "6px 12px", fontSize: "12px" }}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}