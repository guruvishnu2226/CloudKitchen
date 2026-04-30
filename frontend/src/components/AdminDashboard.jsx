import { useState, useEffect } from "react";
import api from "../api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const CATEGORIES = ["Starters", "Main Course", "Breads", "Rice", "Desserts", "Drinks"];
const PIE_COLORS = ["#f97316", "#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#ec4899"];

const STATUS_BADGE = {
  pending:          { bg: "rgba(249,115,22,0.12)",  color: "#f97316", label: "Pending"  },
  cooking:          { bg: "rgba(37,99,235,0.12)",   color: "#2563eb", label: "Cooking"  },
  ready:            { bg: "rgba(16,185,129,0.12)",  color: "#059669", label: "Ready"    },
  "delivered/served": { bg: "rgba(107,114,128,0.12)", color: "#6b7280", label: "Served" },
};

export default function AdminDashboard() {
  const [stats,      setStats]      = useState(null);
  const [menuItems,  setMenuItems]  = useState([]);
  const [activeTab,  setActiveTab]  = useState("dashboard");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [form,       setForm]       = useState({ item_name: "", price: "", category: "Starters" });
  const [adding,     setAdding]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmItem,setConfirmItem]= useState(null);

  useEffect(() => {
    fetchStats();
    fetchMenu();
  }, []);

  async function fetchStats() {
    try {
      const res = await api.get("/api/admin/stats");
      setStats(res.data);
    } catch {
      setError("Failed to load stats.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMenu() {
    try {
      const res = await api.get("/api/admin/menu");
      setMenuItems(res.data);
    } catch {}
  }

  function flash(msg) { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!form.item_name.trim() || !form.price) { setError("Item name and price are required."); return; }
    setAdding(true);
    try {
      await api.post("/api/admin/menu/add", {
        item_name: form.item_name.trim(),
        price: parseFloat(form.price),
        category: form.category,
      });
      flash(`✅ "${form.item_name}" added!`);
      setForm({ item_name: "", price: "", category: "Starters" });
      fetchMenu();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add item.");
    } finally { setAdding(false); }
  }

  async function confirmDelete() {
    const item = confirmItem;
    setConfirmItem(null);
    setDeletingId(item.id);
    try {
      await api.delete(`/api/admin/menu/delete/${item.id}`);
      flash(`🗑️ "${item.item_name}" removed.`);
      setMenuItems(prev => prev.filter(m => m.id !== item.id));
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete.");
    } finally { setDeletingId(null); }
  }

  const categories = [...new Set(menuItems.map(i => i.category))];

  // Pie data from menu categories
  const pieData = categories.map(cat => ({
    name: cat,
    value: menuItems.filter(i => i.category === cat).length
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

      {/* ── Confirm Delete Modal ── */}
      {confirmItem && (
        <div className="confirm-overlay">
          <div className="glass confirm-modal">
            <div className="confirm-icon">🗑️</div>
            <h3 className="confirm-title">Delete Item?</h3>
            <p className="confirm-msg">
              Remove <b>"{confirmItem.item_name}"</b> from the menu? This cannot be undone.
            </p>
            <div className="confirm-actions">
              <button className="back-btn" onClick={() => setConfirmItem(null)}>Cancel</button>
              <button className="admin-confirm-delete-btn" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Bar ── */}
      <div className="admin-tab-bar">
        {["dashboard", "menu"].map(tab => (
          <button
            key={tab}
            className={`admin-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "dashboard" ? "📊 Dashboard" : "🍽️ Menu Management"}
          </button>
        ))}
      </div>

      {error   && <div className="error-banner"   style={{ margin: "0 0 16px" }}><span>⚠️</span> {error}</div>}
      {success && <div className="success-banner" style={{ margin: "0 0 16px" }}><span>✅</span> {success}</div>}

      {/* ══════════════ DASHBOARD TAB ══════════════ */}
      {activeTab === "dashboard" && (
        <div className="admin-wrap">
          {loading ? (
            <div className="kitchen-loading"><div className="kitchen-loading-spinner">📊</div><p>Loading stats…</p></div>
          ) : stats && (
            <>
              {/* Stat Cards */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: "rgba(249,115,22,0.1)", color: "#f97316" }}>🛒</div>
                  <div>
                    <p className="admin-stat-label">Today's Orders</p>
                    <p className="admin-stat-value">{stats.today_orders}</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb" }}>👨🍳</div>
                  <div>
                    <p className="admin-stat-label">Cooking Now</p>
                    <p className="admin-stat-value">{stats.cooking}</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>💰</div>
                  <div>
                    <p className="admin-stat-label">Today's Revenue</p>
                    <p className="admin-stat-value">₹{stats.revenue.toFixed(0)}</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>🍽️</div>
                  <div>
                    <p className="admin-stat-label">Menu Items</p>
                    <p className="admin-stat-value">{stats.total_items}</p>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="admin-charts-row">
                <div className="glass admin-chart-card">
                  <p className="admin-section-title">Monthly Orders</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.monthly_orders} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} />
                      <YAxis tick={{ fontSize: 12, fill: "#888" }} />
                      <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid rgba(0,0,0,0.08)", fontSize: "13px" }} />
                      <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass admin-chart-card">
                  <p className="admin-section-title">Menu by Category</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "13px" }} />
                      <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="glass admin-table-card">
                <p className="admin-section-title">Recent Orders</p>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Type</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_orders.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: "center", color: "#aaa", padding: "20px" }}>No orders yet</td></tr>
                      ) : stats.recent_orders.map(order => {
                        const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
                        return (
                          <tr key={order.id}>
                            <td><b>#{order.id}</b></td>
                            <td style={{ textTransform: "capitalize" }}>{order.order_type?.replace("_", " ")}</td>
                            <td style={{ color: "#f97316", fontWeight: 700 }}>₹{order.total_price}</td>
                            <td>
                              <span style={{ background: badge.bg, color: badge.color, padding: "3px 10px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 700 }}>
                                {badge.label}
                              </span>
                            </td>
                            <td style={{ color: "#888", fontSize: "0.82rem" }}>{order.created_at}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════ MENU TAB ══════════════ */}
      {activeTab === "menu" && (
        <div className="admin-wrap">
          <div className="glass admin-form-card">
            <p className="admin-section-title">Add New Item</p>
            <form className="admin-form" onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input className="form-input" placeholder="e.g. Paneer Butter Masala" value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} />
              </div>
              <div className="admin-form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Price (₹)</label>
                  <input className="form-input" type="number" min="1" step="0.01" placeholder="e.g. 180" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <select className="form-input form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button className="submit-btn" type="submit" disabled={adding}>{adding ? "Adding…" : "+ Add to Menu"}</button>
            </form>
          </div>

          <div className="glass admin-list-card">
            <p className="admin-section-title">
              Current Menu
              <span className="admin-count">{menuItems.length} items</span>
            </p>
            {categories.map(cat => (
              <div key={cat} className="admin-category">
                <div className="menu-cat-header">
                  <span className="menu-cat-name">{cat}</span>
                  <span className="menu-cat-count">{menuItems.filter(i => i.category === cat).length} items</span>
                </div>
                {menuItems.filter(i => i.category === cat).map(item => (
                  <div key={item.id} className="admin-item-row">
                    <span className="admin-item-name">{item.item_name}</span>
                    <span className="admin-item-price">₹{item.price}</span>
                    <button className="admin-delete-btn" onClick={() => setConfirmItem(item)} disabled={deletingId === item.id}>
                      {deletingId === item.id ? "…" : "🗑️"}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
