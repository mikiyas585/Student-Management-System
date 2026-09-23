import { useState } from "react";
import api from "../api/axios";

export default function SystemTest() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runTests() {
    setLoading(true);
    setError("");
    const testResults = {};

    try {
      // Test 1: Health Check (no auth)
      try {
        const response = await fetch("http://localhost:5001/api/health");
        const data = await response.json();
        testResults.health = { status: "✅ PASS", data };
      } catch (err) {
        testResults.health = { status: "❌ FAIL", error: err.message };
      }

      // Test 2: Debug Counts (no auth)
      try {
        const response = await fetch("http://localhost:5001/api/debug/counts");
        const data = await response.json();
        testResults.counts = { status: "✅ PASS", data };
      } catch (err) {
        testResults.counts = { status: "❌ FAIL", error: err.message };
      }

      // Test 3: Login
      try {
        const response = await api.post("/auth/login", {
          email: "admin@school.com",
          password: "password123"
        });
        testResults.login = { status: "✅ PASS", token: response.data.data.token.substring(0, 20) + "..." };
        
        // Store token for next tests
        localStorage.setItem("token", response.data.data.token);
      } catch (err) {
        testResults.login = { status: "❌ FAIL", error: err.response?.data?.message || err.message };
      }

      // Test 4: Get Teachers (needs auth)
      try {
        const response = await api.get("/teachers");
        testResults.teachers = { 
          status: "✅ PASS", 
          count: response.data.teachers?.length || 0,
          teachers: response.data.teachers 
        };
      } catch (err) {
        testResults.teachers = { status: "❌ FAIL", error: err.response?.data?.message || err.message };
      }

      // Test 5: Get Grades (needs auth)
      try {
        const response = await api.get("/teachers/grades/all");
        testResults.grades = { 
          status: "✅ PASS", 
          count: response.data.grades?.length || 0 
        };
      } catch (err) {
        testResults.grades = { status: "❌ FAIL", error: err.response?.data?.message || err.message };
      }

      // Test 6: Get Subjects (needs auth)
      try {
        const response = await api.get("/teachers/subjects/all");
        testResults.subjects = { 
          status: "✅ PASS", 
          count: response.data.subjects?.length || 0 
        };
      } catch (err) {
        testResults.subjects = { status: "❌ FAIL", error: err.response?.data?.message || err.message };
      }

      // Test 7: Get Sections (needs auth)
      try {
        const response = await api.get("/teachers/sections/all");
        testResults.sections = { 
          status: "✅ PASS", 
          count: response.data.sections?.length || 0 
        };
      } catch (err) {
        testResults.sections = { status: "❌ FAIL", error: err.response?.data?.message || err.message };
      }

      setResults(testResults);
    } catch (err) {
      setError("Test suite failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>🔧 System Test Page</h1>
        <p>This page tests all API endpoints to verify the system is working.</p>

        <button 
          onClick={runTests} 
          disabled={loading}
          style={{ marginTop: "20px", padding: "12px 24px", fontSize: "16px" }}
        >
          {loading ? "Running Tests..." : "🚀 Run All Tests"}
        </button>

        {error && (
          <div className="error" style={{ marginTop: "20px" }}>
            {error}
          </div>
        )}

        {results && (
          <div style={{ marginTop: "30px" }}>
            <h2>Test Results:</h2>
            
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "20px", borderRadius: "8px", marginTop: "20px" }}>
              {Object.entries(results).map(([test, result]) => (
                <div key={test} style={{ marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "15px" }}>
                  <h3>{test.toUpperCase()}: {result.status}</h3>
                  <pre style={{ background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "4px", overflow: "auto" }}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "30px", padding: "20px", background: "rgba(52, 211, 153, 0.1)", borderRadius: "8px" }}>
              <h3>📊 Summary:</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li>✅ Passed: {Object.values(results).filter(r => r.status.includes("✅")).length}</li>
                <li>❌ Failed: {Object.values(results).filter(r => r.status.includes("❌")).length}</li>
              </ul>

              {Object.values(results).every(r => r.status.includes("✅")) && (
                <div style={{ marginTop: "20px", padding: "15px", background: "rgba(52, 211, 153, 0.2)", borderRadius: "8px" }}>
                  <h2>🎉 ALL TESTS PASSED!</h2>
                  <p>The system is working correctly. You can now:</p>
                  <ul>
                    <li>Go to Dashboard</li>
                    <li>Go to Teachers page</li>
                    <li>Create new teachers</li>
                    <li>Manage assignments</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
