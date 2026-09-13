import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, onClose, initialTab }) {
  var [activeTab, setActiveTab] = useState(initialTab || "login");
  var [error, setError] = useState("");

  // Login state
  var [loginEmail, setLoginEmail] = useState("");
  var [loginPassword, setLoginPassword] = useState("");

  // Register state
  var [regForm, setRegForm] = useState({ name: "", email: "", password: "", role: "student", grade: "" });

  var navigate = useNavigate();
  var { login } = useAuth();

  function switchTab(tab) {
    setActiveTab(tab);
    setError("");
  }

  function handleRegChange(e) {
    setRegForm({ ...regForm, [e.target.name]: e.target.value });
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      var response = await api.post("/auth/login", { email: loginEmail, password: loginPassword });
      login(response.data.token, response.data.user);
      onClose();
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    try {
      var response = await api.post("/auth/register", regForm);
      login(response.data.token, response.data.user);
      onClose();
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  }

  // Sync tab when opened with a specific tab
  useEffect(function () {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
      setError("");
    }
  }, [isOpen, initialTab]);

  return (
    <div className={"auth-overlay" + (isOpen ? " open" : "")} id="auth-modal">
      <div className="auth-backdrop" onClick={onClose} />

      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose} id="auth-modal-close" aria-label="Close">
          ✕
        </button>

        <div className="auth-modal-title">
          {activeTab === "login" ? "Welcome Back" : "Join EduVerse"}
        </div>
        <div className="auth-modal-subtitle">
          {activeTab === "login"
            ? "Sign in to access your dashboard"
            : "Create your account to get started"}
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={"auth-tab" + (activeTab === "login" ? " active" : "")}
            onClick={function () { switchTab("login"); }}
            id="auth-tab-login"
          >
            Sign In
          </button>
          <button
            className={"auth-tab" + (activeTab === "register" ? " active" : "")}
            onClick={function () { switchTab("register"); }}
            id="auth-tab-register"
          >
            Register
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {/* LOGIN FORM */}
        {activeTab === "login" && (
          <form onSubmit={handleLogin} id="login-form">
            <label>Email</label>
            <input
              type="email"
              value={loginEmail}
              onChange={function (e) { setLoginEmail(e.target.value); }}
              placeholder="you@school.com"
              required
              id="login-email"
            />
            <label>Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={function (e) { setLoginPassword(e.target.value); }}
              placeholder="••••••••"
              required
              id="login-password"
            />
            <button type="submit" id="login-submit">Sign In</button>

            <div className="auth-demo">
              <p>
                <strong>Demo accounts:</strong><br />
                Admin: admin@school.com / password123<br />
                Teacher: teacher@school.com / password123
              </p>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {activeTab === "register" && (
          <form onSubmit={handleRegister} id="register-form">
            <label>Full Name</label>
            <input
              name="name"
              value={regForm.name}
              onChange={handleRegChange}
              placeholder="John Doe"
              required
              id="register-name"
            />
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={regForm.email}
              onChange={handleRegChange}
              placeholder="you@school.com"
              required
              id="register-email"
            />
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={regForm.password}
              onChange={handleRegChange}
              placeholder="••••••••"
              required
              id="register-password"
            />
            <label>I am a</label>
            <select name="role" value={regForm.role} onChange={handleRegChange} id="register-role">
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
            {regForm.role === "student" && (
              <>
                <label>Grade</label>
                <input
                  name="grade"
                  value={regForm.grade}
                  onChange={handleRegChange}
                  placeholder="e.g. Grade 9"
                  id="register-grade"
                />
              </>
            )}
            <button type="submit" id="register-submit">Create Account</button>
          </form>
        )}
      </div>
    </div>
  );
}
