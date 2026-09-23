import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Subscriptions() {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [records, setRecords] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadAll() {
    try {
      console.log("[Subscriptions] Loading subscriptions...");
      const [subsRes, recordsRes] = await Promise.all([
        api.get("/subscriptions"),
        api.get("/subscriptions/my"),
      ]);
      console.log("[Subscriptions] Data loaded:", { 
        subscriptions: subsRes.data, 
        records: recordsRes.data 
      });
      setSubs(subsRes.data.subscriptions || []);
      setRecords(recordsRes.data.records || []);
    } catch (err) {
      console.error("[Subscriptions] Error loading data:", err);
      setError(err.response?.data?.message || err.message || "Could not load subscriptions.");
    }
  }

  useEffect(function () {
    loadAll();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/subscriptions", { name, description, amount });
      setName(""); setDescription(""); setAmount("");
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create subscription.");
    }
  }

  async function handlePay(id) {
    setError(""); setMessage("");
    try {
      const response = await api.post("/subscriptions/" + id + "/pay");
      setMessage("Payment successful! Amount paid: " + response.data.amountPaid);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this subscription?")) return;
    setError(""); setMessage("");
    try {
      await api.delete("/subscriptions/" + id);
      setMessage("Subscription deleted successfully.");
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete subscription.");
    }
  }

  return (
    <div className="container">
      {user.role === "admin" && (
        <div className="card">
          <h2>Open a new subscription</h2>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleCreate}>
            <label>Name</label>
            <input value={name} onChange={function (e) { setName(e.target.value); }} required />
            <label>Description</label>
            <input value={description} onChange={function (e) { setDescription(e.target.value); }} />
            <label>Amount</label>
            <input type="number" step="0.01" value={amount} onChange={function (e) { setAmount(e.target.value); }} required />
            <button type="submit">Open subscription</button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Available Subscriptions</h2>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        {subs.length === 0 && <p>None available right now.</p>}
        {subs.map(function (s) {
          return (
            <div key={s.id} style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}>
              <strong>{s.name}</strong> - ${s.amount}
              <p style={{ margin: "4px 0" }}>{s.description}</p>
              {user.role === "student" && (
                <button onClick={function () { handlePay(s.id); }}>Subscribe & Pay</button>
              )}
              {user.role === "admin" && (
                <button 
                  className="danger"
                  onClick={function () { handleDelete(s.id); }}
                  style={{ marginLeft: "10px" }}
                >
                  Delete
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2>{user.role === "student" ? "My Payment History" : "All Payment Records"}</h2>
        <table>
          <thead>
            <tr>
              {user.role !== "student" && <th>Student</th>}
              <th>Subscription</th><th>Amount</th><th>Status</th><th>Paid At</th>
            </tr>
          </thead>
          <tbody>
            {records.map(function (r) {
              return (
                <tr key={r.id}>
                  {user.role !== "student" && <td>{r.student_name}</td>}
                  <td>{r.subscription_name}</td>
                  <td>${r.amount_paid}</td>
                  <td><span className="badge">{r.status}</span></td>
                  <td>{r.paid_at ? new Date(r.paid_at).toLocaleDateString() : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {records.length === 0 && <p>No records yet.</p>}
      </div>
    </div>
  );
}
