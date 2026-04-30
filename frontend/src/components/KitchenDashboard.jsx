import { useState, useEffect } from "react";
import api from "../api";

const STATUS_STYLES = {
  pending:  { label: "Pending",  color: "#f97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.3)"  },
  cooking:  { label: "Cooking",  color: "#2563eb", bg: "rgba(37,99,235,0.1)",   border: "rgba(37,99,235,0.3)"   },
  ready:    { label: "Ready",    color: "#059669", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)"  },
};

export default function KitchenDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  async function fetchTickets() {
    setError("");
    try {
      const res = await api.get("/api/kitchen/tickets");
      setTickets(res.data);
    } catch {
      setError("Failed to load orders. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [api]);

  async function updateStatus(orderId, newStatus) {
    try {
      await api.post(`/api/kitchen/update_status/${orderId}`, { status: newStatus });
      // update locally without waiting for next poll
      setTickets(prev => prev.map(t =>
        t.id === orderId ? { ...t, status: newStatus } : t
      ));
    } catch {
      setError(`Failed to update order #${orderId}.`);
    }
  }

  if (loading) {
    return (
      <div className="kitchen-loading">
        <div className="kitchen-loading-spinner">🍳</div>
        <p>Loading kitchen orders...</p>
      </div>
    );
  }

  return (
    <div className="kitchen-wrap">
      {error && (
        <div className="error-banner" style={{ marginBottom: "20px" }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="kitchen-empty">
          <span className="ke-icon">✅</span>
          <h3>All caught up!</h3>
          <p>No orders in the queue right now.</p>
        </div>
      ) : (
        <div className="kitchen-grid">
          {tickets.map(ticket => {
            const style = STATUS_STYLES[ticket.status] ?? STATUS_STYLES.pending;
            const items = typeof ticket.items === "string"
              ? JSON.parse(ticket.items)
              : ticket.items;

            return (
              <div key={ticket.id} className="glass kitchen-ticket">

                {/* Header */}
                <div className="ticket-header">
                  <div>
                    <span className="ticket-id">#{ticket.daily_no} Today</span>
                    <span className="ticket-tracking"> · {ticket.id}</span>
                  </div>
                  <span className="ticket-time">
                    {new Date(ticket.created_at).toLocaleTimeString()}
                  </span>
                </div>

                {/* Status badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "3px 10px", borderRadius: "99px", fontSize: "0.72rem",
                  fontWeight: 700, background: style.bg,
                  border: `1px solid ${style.border}`, color: style.color,
                }}>
                  {style.label}
                </div>

                {/* Items */}
                <div className="ticket-body">
                  <div className="ticket-label">Items:</div>
                  <div className="ticket-items">
                    {(items || []).map((item, i) => (
                      <div key={i} className="ticket-item">
                        <span>{item.item_name}</span>
                        <span className="ticket-qty">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="ticket-divider" />

                  <div className="ticket-row">
                    <span className="ticket-label">Type:</span>
                    <span className="ticket-val">
                      {ticket.order_type === "dine_in"  && "🪑 Dine In"}
                      {ticket.order_type === "takeaway" && "🛍️ Takeaway"}
                      {ticket.order_type === "delivery" && "🚴 Delivery"}
                    </span>
                  </div>

                  {ticket.order_type === "delivery" && ticket.distance_km && (
                    <div className="ticket-row">
                      <span className="ticket-label">Distance:</span>
                      <span className="ticket-val">{ticket.distance_km} km</span>
                    </div>
                  )}

                  <div className="ticket-row">
                    <span className="ticket-label">Total:</span>
                    <span className="ticket-val ticket-price">₹{ticket.total_price}</span>
                  </div>
                </div>

                {/* Action buttons based on current status */}
                <div style={{ display: "flex", gap: "8px" }}>
                  {ticket.status === "pending" && (
                    <button
                      className="ticket-ready-btn"
                      style={{ background: "linear-gradient(135deg, #f97316, #dc2626)" }}
                      onClick={() => updateStatus(ticket.id, "cooking")}
                    >
                      👨‍🍳 Accept Order
                    </button>
                  )}
                  {ticket.status === "cooking" && (
                    <button
                      className="ticket-ready-btn"
                      onClick={() => updateStatus(ticket.id, "ready")}
                    >
                      ✅ Mark Ready
                    </button>
                  )}
                  {ticket.status === "ready" && (
                    <button
                      className="ticket-ready-btn"
                      style={{ background: "linear-gradient(135deg, #6b7280, #4b5563)" }}
                      onClick={() => updateStatus(ticket.id, "delivered/served")}
                    >
                      🏁 Mark Served
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
