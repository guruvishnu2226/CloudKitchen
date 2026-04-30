import { useNavigate } from "react-router-dom";
import AdminDashboard from "../components/AdminDashboard";

const API = "http://127.0.0.1:5000";

export default function AdminPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="app-shell">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🍳</div>
          <div className="logo-text">
            <h1>BiteCraft</h1>
            <span>Admin Portal</span>
          </div>
        </div>

        <div className="staff-pill">
          <span>⚙️</span>
          <span>{username}</span>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        <div className="page-header">
          <h2>Admin Dashboard</h2>
          <p>Manage your menu items</p>
        </div>
        <AdminDashboard api={API} />
      </main>

    </div>
  );
}
