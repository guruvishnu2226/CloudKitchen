import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { username, password });
      localStorage.setItem("token",    res.data.token);
      localStorage.setItem("role",     res.data.role);
      localStorage.setItem("username", res.data.username);

      if (res.data.role === "kitchen") navigate("/kitchen");
      else if (res.data.role === "admin") navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-login-container">
      <div className="glass-overlay"></div>

      <div className="glass-login-header">
        <h1>BiteCraft</h1>
        <p>Staff Portal</p>
      </div>

      <div className="glass-login-panel-wrapper px-3 px-sm-0 col-md-6 col-sm-6 col-lg-6">
        <div className="glass-login-panel">
          <p className="glass-login-title">Welcome back</p>

          <form className="glass-login-form" onSubmit={handleLogin}>
            {error && (
              <div className="glass-login-error">{error}</div>
            )}

            <div className="glass-input-wrapper">
              <span className="glass-input-icon" style={{ color: '#b05a2a' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input
                className="glass-input"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="glass-input-wrapper">
              <span className="glass-input-icon" style={{ color: '#b05a2a' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                className="glass-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="glass-submit-btn" type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="glass-login-footer">
            Don't have an account? <a href="/" className="glass-login-link">Order Food</a>
          </p>
        </div>
      </div>
    </div>
  );
}
