import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import Menu from "./components/Menu";
import OrderForm from "./components/OrderForm";
import AiWaiter from "./components/AiWaiter";
import Receipt from "./components/Receipt";
import OrderStatus from "./components/OrderStatus";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import KitchenPage from "./pages/KitchenPage";
import AdminPage from "./pages/AdminPage";
import "./App.css";

const API = "http://127.0.0.1:5000";

const NAV = [
  { id: "menu",   icon: "🍽️", label: "Menu"      },
  { id: "order",  icon: "🛒", label: "Order"     },
  { id: "status", icon: "📦", label: "Track"     },
  { id: "waiter", icon: "🤖", label: "AI Waiter" },
];

function CustomerApp() {
  const [menu, setMenu]               = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [cart, setCart]               = useState({});
  const [receipt, setReceipt]         = useState(null);
  const [activeTab, setActiveTab]     = useState("menu");

  useEffect(() => {
    axios.get(`${API}/api/menu`)
      .then(res => setMenu(res.data))
      .catch(() => setMenu([]))
      .finally(() => setMenuLoading(false));
  }, []);

  function goTo(tab) { setActiveTab(tab); setReceipt(null); }

  function handleSelect(name) {
    setCart(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
    setActiveTab("order");
    setReceipt(null);
  }

  const PAGE_META = {
    menu:   { title: "Today's Menu",     sub: "Click any dish to order instantly"   },
    order:  { title: "Place an Order",   sub: "Takeaway · Delivery · Dine In"       },
    status: { title: "Track Your Order", sub: "Enter your Order ID to check status" },
    waiter: { title: "AI Waiter",        sub: "Ask anything — powered by local AI"  },
  };

  return (
    <div className="app-shell">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🍳</div>
          <div className="logo-text">
            <h1>BiteCraft</h1>
            <span>Crafting Cravings Daily</span>
          </div>
        </div>

        <p className="nav-label">Navigation</p>
        {NAV.map(n => (
          <div
            key={n.id}
            className={`nav-item ${activeTab === n.id ? "active" : ""}`}
            onClick={() => goTo(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-text">{n.label}</span>
            {n.id === "waiter" && <span className="nav-badge">AI</span>}
          </div>
        ))}

        <div className="sidebar-footer">
          <a href="/" className="staff-login-link">
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </a>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        <div className="page-header">
          <h2>{PAGE_META[activeTab].title}</h2>
          <p>{PAGE_META[activeTab].sub}</p>
        </div>

        {activeTab === "menu" && (
          <Menu menu={menu} loading={menuLoading} onSelect={handleSelect} />
        )}

        {activeTab === "order" && (
          receipt
            ? <Receipt receipt={receipt} onBack={() => setReceipt(null)} />
            : <OrderForm api={API} cart={cart} setCart={setCart} onReceipt={(data) => { setReceipt(data); setCart({}); }} menu={menu} />
        )}

        {activeTab === "status" && <OrderStatus api={API} />}
        {activeTab === "waiter" && <AiWaiter api={API} />}
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mobile-nav">
        {NAV.map(n => (
          <button
            key={n.id}
            className={`mobile-nav-item ${activeTab === n.id ? "active" : ""}`}
            onClick={() => goTo(n.id)}
          >
            <span className="mn-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<Home />} />
      <Route path="/menu"    element={<CustomerApp />} />
      <Route path="/login"   element={<Login />} />
      <Route path="/about"   element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/kitchen" element={
        <ProtectedRoute allowedRoles={["kitchen", "admin"]}>
          <KitchenPage />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
