import { useState, useEffect } from "react";
import api from "../api/axios";

export default function TeacherManagementBoard() {
  // Main state for teachers, assignments, and linking
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    password: "",
    qualifications: "",
    specialization: "",
    years_of_experience: ""
  });
  
  const [newAssignment, setNewAssignment] = useState({
    teacher_id: "",
    grade_id: "",
    subject_id: "",
    section_id: "",
    academic_year: new Date().getFullYear()
  });
  
  const [studentLink, setStudentLink] = useState({
    teacher_assignment_id: "",
    student_id: ""
  });
  
  // Filter states
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Messages
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // Load all reference data
  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log("[TeacherManagementBoard] Loading all data...");
      
      const [
        teachersRes, 
        assignmentsRes, 
        gradesRes, 
        subjectsRes, 
        sectionsRes
      ] = await Promise.all([
        api.get("/teachers"),
        api.get("/teachers/assignments/all"),
        api.get("/teachers/grades/all"),
        api.get("/teachers/subjects/all"),
        api.get("/teachers/sections/all")
      ]);
      
      console.log("[TeacherManagementBoard] Data loaded:", {
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
      
      // Keep the student selector populated even before filters are chosen.
      loadAvailableStudents();
      
    } catch (err) {
      console.error("[TeacherManagementBoard] Error loading data:", err);
      setError(err.response?.data?.message || err.message || "Failed to load data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };
  
  // Load available students for linking
  const loadAvailableStudents = async () => {
    try {
      const params = {};
      if (selectedGrade) params.grade_id = selectedGrade;
      if (selectedSubject) params.subject_id = selectedSubject;
      
      const res = await api.get("/teachers/students/available", { params });
      setAvailableStudents(res.data.data?.students || res.data.students || []);
    } catch (err) {
      console.error("Error loading students:", err);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);
  
  // Handle teacher creation
  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    
    try {
      await api.post("/teachers", newTeacher);
      setMessage("Teacher created successfully!");
      setNewTeacher({
        name: "",
        email: "",
        password: "",
        qualifications: "",
        specialization: "",
        years_of_experience: ""
      });
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create teacher.");
    }
  };
  
  // Handle assignment creation
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    
    try {
      await api.post("/teachers/assignments", newAssignment);
      setMessage("Assignment created successfully!");
      setNewAssignment({
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
  };
  
  // Handle student linking
  const handleLinkStudent = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    
    try {
      await api.post("/teachers/link-student", studentLink);
      setMessage("Student linked successfully!");
      setStudentLink({
        teacher_assignment_id: "",
        student_id: ""
      });
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to link student.");
    }
  };
  
  // Handle teacher deletion
  const handleDeleteTeacher = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    
    try {
      await api.delete(`/teachers/${id}`);
      setMessage("Teacher deleted successfully!");
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete teacher.");
    }
  };
  
  // Handle assignment deletion
  const handleDeleteAssignment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    
    try {
      await api.delete(`/teachers/assignments/${id}`);
      setMessage("Assignment deleted successfully!");
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete assignment.");
    }
  };
  
  // Handle assignment status toggle
  const handleToggleAssignment = async (id, currentStatus) => {
    try {
      await api.put(`/teachers/assignments/${id}`, {
        is_active: !currentStatus
      });
      setMessage("Assignment status updated!");
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update assignment.");
    }
  };
  
  // Filter assignments based on selected filters
  const filteredAssignments = assignments.filter(assignment => {
    const matchesTeacher = !selectedTeacher || assignment.teacher_id == selectedTeacher;
    const matchesGrade = !selectedGrade || assignment.grade_id == selectedGrade;
    const matchesSubject = !selectedSubject || assignment.subject_id == selectedSubject;
    const matchesSearch = !searchTerm || 
      assignment.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.grade_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.section_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTeacher && matchesGrade && matchesSubject && matchesSearch;
  });
  
  // Get sections filtered by selected grade
  const sectionsForAssignmentGrade = sections.filter(section => 
    section.grade_id == newAssignment.grade_id
  );

  function getSectionLetter(sectionName) {
    return sectionName.replace(/^Section\s+/i, "").trim().toUpperCase();
  }
  
  // Get assignments for selected teacher
  const assignmentsForTeacher = assignments.filter(assignment => 
    assignment.teacher_id == selectedTeacher
  );

  return (
    <div className="teacher-management-board">
      {/* Header */}
      <div className="card" style={{ background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.05))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2>👨‍🏫 Teacher Management Board</h2>
            <p style={{ marginTop: 4, fontSize: 14, color: "var(--text-secondary)" }}>
              Manage teachers, assign grades/subjects/sections, and link students to teachers
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button 
              onClick={loadAllData} 
              className="btn" 
              style={{ fontSize: 13 }}
              disabled={loading}
            >
              🔄 {loading ? "Loading..." : "Refresh Data"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      {message && <div className="success" style={{ margin: "16px 0" }}>{message}</div>}
      {error && <div className="error" style={{ margin: "16px 0" }}>{error}</div>}
      
      {/* Main Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 20, marginBottom: 24 }}>
        
        {/* Section 1: Create New Teacher */}
        <div className="card">
          <h3>➕ Create New Teacher</h3>
          <form onSubmit={handleCreateTeacher} style={{ marginTop: 12 }}>
            <label>Full Name</label>
            <input
              type="text"
              value={newTeacher.name}
              onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
              placeholder="Enter teacher's full name"
              required
            />
            
            <label>Email Address</label>
            <input
              type="email"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
              placeholder="teacher@school.edu"
              required
            />
            
            <label>Password</label>
            <input
              type="password"
              value={newTeacher.password}
              onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})}
              placeholder="Set initial password"
              required
            />
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label>Qualifications</label>
                <input
                  type="text"
                  value={newTeacher.qualifications}
                  onChange={(e) => setNewTeacher({...newTeacher, qualifications: e.target.value})}
                  placeholder="e.g., M.Ed, B.Sc"
                />
              </div>
              
              <div>
                <label>Specialization</label>
                <input
                  type="text"
                  value={newTeacher.specialization}
                  onChange={(e) => setNewTeacher({...newTeacher, specialization: e.target.value})}
                  placeholder="e.g., Mathematics, Science"
                />
              </div>
            </div>
            
            <label>Years of Experience</label>
            <input
              type="number"
              value={newTeacher.years_of_experience}
              onChange={(e) => setNewTeacher({...newTeacher, years_of_experience: e.target.value})}
              placeholder="0"
              min="0"
            />
            
            <button type="submit" style={{ marginTop: 16 }}>Create Teacher Account</button>
          </form>
        </div>
        
        {/* Section 2: Create New Assignment */}
        <div className="card">
          <h3>📋 Assign Teacher to Grade/Subject/Section</h3>
          <form onSubmit={handleCreateAssignment} style={{ marginTop: 12 }}>
            <label>Select Teacher</label>
            <select
              value={newAssignment.teacher_id}
              onChange={(e) => setNewAssignment({...newAssignment, teacher_id: e.target.value})}
              required
            >
              <option value="">-- Choose Teacher --</option>
              {teachers.map(teacher => (
                <option key={teacher.teacher_id} value={teacher.teacher_id}>
                  {teacher.name} ({teacher.email})
                </option>
              ))}
            </select>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label>Grade</label>
                <select
                  value={newAssignment.grade_id}
                  onChange={(e) => setNewAssignment({
                    ...newAssignment,
                    grade_id: e.target.value,
                    section_id: ""
                  })}
                  required
                >
                  <option value="">-- Select Grade --</option>
                  {grades.map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>Subject</label>
                <select
                  value={newAssignment.subject_id}
                  onChange={(e) => setNewAssignment({...newAssignment, subject_id: e.target.value})}
                  required
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <label>Section</label>
            <select
              value={newAssignment.section_id}
              onChange={(e) => setNewAssignment({...newAssignment, section_id: e.target.value})}
              required
            >
              <option value="">-- Select Section --</option>
              {sectionsForAssignmentGrade.map(section => (
                <option key={section.id} value={section.id}>
                  {getSectionLetter(section.name)}
                </option>
              ))}
            </select>
            
            <label>Academic Year</label>
            <input
              type="number"
              value={newAssignment.academic_year}
              onChange={(e) => setNewAssignment({...newAssignment, academic_year: e.target.value})}
              min="2000"
              max="2050"
              required
            />
            
            <button type="submit" style={{ marginTop: 16 }}>Create Assignment</button>
          </form>
        </div>
        
        {/* Section 3: Link Student to Teacher Assignment */}
        <div className="card">
          <h3>🔗 Link Student to Teacher</h3>
          <form onSubmit={handleLinkStudent} style={{ marginTop: 12 }}>
            <label>Select Teacher Assignment</label>
            <select
              value={studentLink.teacher_assignment_id}
              onChange={(e) => setStudentLink({...studentLink, teacher_assignment_id: e.target.value})}
              required
            >
              <option value="">-- Choose Assignment --</option>
              {assignments.map(assignment => (
                <option key={assignment.assignment_id} value={assignment.assignment_id}>
                  {assignment.teacher_name} → {assignment.grade_name} {assignment.section_name} ({assignment.subject_name})
                </option>
              ))}
            </select>
            
            <label>Select Student</label>
            <select
              value={studentLink.student_id}
              onChange={(e) => setStudentLink({...studentLink, student_id: e.target.value})}
              required
            >
              <option value="">-- Choose Student --</option>
              {availableStudents.map(student => (
                <option key={student.student_id} value={student.student_id}>
                  {student.name} ({student.email}) - Grade: {student.grade}
                </option>
              ))}
            </select>
            
            <div style={{ marginTop: 12, fontSize: 13, color: "var(--text-secondary)" }}>
              <p>💡 Filter students by grade/subject above to see relevant students.</p>
            </div>
            
            <button type="submit" style={{ marginTop: 16 }}>Link Student</button>
          </form>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3>🔍 Filter Assignments</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div>
            <label>Filter by Teacher</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">All Teachers</option>
              {teachers.map(teacher => (
                <option key={teacher.teacher_id} value={teacher.teacher_id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label>Filter by Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                loadAvailableStudents();
              }}
              style={{ width: "100%" }}
            >
              <option value="">All Grades</option>
              {grades.map(grade => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label>Filter by Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                loadAvailableStudents();
              }}
              style={{ width: "100%" }}
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label>Search Assignments</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by teacher, grade, subject..."
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>
      
      {/* Teachers List */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3>👨‍🏫 Teachers List ({teachers.length})</h3>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Total: {teachers.length} teachers
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Teacher Name</th>
              <th>Email</th>
              <th>Qualifications</th>
              <th>Specialization</th>
              <th>Experience</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => (
              <tr key={teacher.teacher_id}>
                <td>
                  <strong>{teacher.name}</strong>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>ID: {teacher.teacher_id}</div>
                </td>
                <td>{teacher.email}</td>
                <td>{teacher.qualifications || "-"}</td>
                <td>{teacher.specialization || "-"}</td>
                <td>{teacher.years_of_experience} years</td>
                <td>
                  <button 
                    className="danger" 
                    onClick={() => handleDeleteTeacher(teacher.teacher_id)}
                    style={{ padding: "4px 8px", fontSize: 12 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {teachers.length === 0 && <p style={{ marginTop: 12 }}>No teachers found.</p>}
      </div>
      
      {/* Assignments List */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3>📋 Teacher Assignments ({filteredAssignments.length})</h3>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Showing {filteredAssignments.length} of {assignments.length} assignments
          </div>
        </div>
        
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
            {filteredAssignments.map(assignment => (
              <tr key={assignment.assignment_id}>
                <td>
                  <strong>{assignment.teacher_name}</strong>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>ID: {assignment.teacher_id}</div>
                </td>
                <td>{assignment.grade_name}</td>
                <td>{assignment.subject_name}</td>
                <td>{assignment.section_name}</td>
                <td>{assignment.academic_year}</td>
                <td>
                  <span 
                    className="badge" 
                    style={{ 
                      background: assignment.is_active ? "rgba(52, 211, 153, 0.2)" : "rgba(239, 68, 68, 0.2)",
                      color: assignment.is_active ? "#34d399" : "#ef4444",
                      cursor: "pointer"
                    }}
                    onClick={() => handleToggleAssignment(assignment.assignment_id, assignment.is_active)}
                  >
                    {assignment.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{assignment.assigned_by_name}</td>
                <td>
                  <button 
                    className="danger" 
                    onClick={() => handleDeleteAssignment(assignment.assignment_id)}
                    style={{ padding: "4px 8px", fontSize: 12, marginRight: 8 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAssignments.length === 0 && <p style={{ marginTop: 12 }}>No assignments found with current filters.</p>}
      </div>
      
      {/* Reference Data Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 20 }}>
        <div className="card" style={{ margin: 0, padding: 16 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>📚 Grades Available</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: "4px 0" }}>{grades.length}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Grade Levels</div>
        </div>
        
        <div className="card" style={{ margin: 0, padding: 16 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>📖 Subjects Available</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)", margin: "4px 0" }}>{subjects.length}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Academic Subjects</div>
        </div>
        
        <div className="card" style={{ margin: 0, padding: 16 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>🏫 Sections Available</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--cyan)", margin: "4px 0" }}>{sections.length}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Class Sections</div>
        </div>
        
        <div className="card" style={{ margin: 0, padding: 16 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>👥 Students Available</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#34d399", margin: "4px 0" }}>{availableStudents.length}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>For Linking</div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="card" style={{ marginTop: 20, background: "rgba(59, 130, 246, 0.05)" }}>
        <h4>📝 How to Use This Board</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginTop: 12 }}>
          <div>
            <strong>1. Create Teacher</strong>
            <p style={{ fontSize: 13, marginTop: 4 }}>Add new teacher accounts with their qualifications and specialization.</p>
          </div>
          <div>
            <strong>2. Assign Teachers</strong>
            <p style={{ fontSize: 13, marginTop: 4 }}>Assign teachers to specific grades, subjects, and sections for each academic year.</p>
          </div>
          <div>
            <strong>3. Link Students</strong>
            <p style={{ fontSize: 13, marginTop: 4 }}>Link students to teacher assignments based on their grade and subject.</p>
          </div>
          <div>
            <strong>4. Manage Status</strong>
            <p style={{ fontSize: 13, marginTop: 4 }}>Toggle assignment status (active/inactive) and delete as needed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}