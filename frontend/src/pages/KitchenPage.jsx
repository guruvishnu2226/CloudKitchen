import { useNavigate } from "react-router-dom";
import KitchenDashboard from "../components/KitchenDashboard";

export default function KitchenPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Chef";

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
            <span>Kitchen Portal</span>
          </div>
        </div>

        <div className="staff-pill">
          <span>👨🍳</span>
          <span>{username}</span>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        <div className="page-header">
          <h2>Kitchen Dashboard</h2>
          <p>Active orders — auto refreshes every 5 seconds</p>
        </div>
        <KitchenDashboard />
      </main>

    </div>
  );
}
