import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data.data;  // Get from data.data
      login(token, user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <div className="card">
        <h2>Log in</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} required />
          <label>Password</label>
          <input type="password" value={password} onChange={function (e) { setPassword(e.target.value); }} required />
          <button type="submit">Log in</button>
        </form>
        <p>No account? <Link to="/register">Register</Link></p>
        <p style={{ fontSize: 12, color: "#666" }}>
          Demo admin: admin@school.com / password123<br />
          Demo teacher: teacher@school.com / password123
        </p>
      </div>
    </div>
  );
}
