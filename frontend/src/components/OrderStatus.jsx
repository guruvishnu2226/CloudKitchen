import { useState } from "react";
import axios from "axios";

const STATUS_INFO = {
  pending:         { icon: "⏳", label: "Order Received",  msg: "Your order is waiting to be accepted by the kitchen.",  color: "#f97316" },
  cooking:         { icon: "👨🍳", label: "Being Prepared", msg: "The chef is cooking your order right now!",              color: "#2563eb" },
  ready:           { icon: "✅", label: "Ready!",           msg: "Your order is ready. Please collect / expect delivery.", color: "#059669" },
  "delivered/served": { icon: "🏁", label: "Served",        msg: "Your order has been delivered. Enjoy your meal!",        color: "#6b7280" },
};

export default function OrderStatus({ api }) {
  const [orderId, setOrderId] = useState("");
  const [status,  setStatus]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function checkStatus(e) {
    e.preventDefault();
    setError("");
    setStatus(null);
    if (!orderId.trim()) { setError("Please enter your Order ID."); return; }
    setLoading(true);
    try {
      const res = await axios.get(`${api}/api/order/status/${orderId.trim()}`);
      setStatus(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Order not found. Check your Order ID.");
    } finally {
      setLoading(false);
    }
  }

  const info = status ? (STATUS_INFO[status.status] ?? STATUS_INFO.pending) : null;

  return (
    <div style={{ maxWidth: "460px", margin: "0 auto" }}>
      <div className="glass form-card">
        <p className="preview-title">Track Your Order</p>

        <form onSubmit={checkStatus}>
          {error && (
            <div className="error-banner" style={{ marginBottom: "14px" }}>
              <span>⚠️</span> {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Order ID</label>
            <input
              className="form-input"
              placeholder="e.g. 42"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
            />
          </div>
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Checking…" : "Check Status →"}
          </button>
        </form>

        {status && info && (
          <div style={{ marginTop: "22px" }}>
            <div className="preview-divider" />
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "2.8rem", marginBottom: "10px" }}>{info.icon}</div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "1.1rem", fontWeight: 700,
                color: info.color, marginBottom: "6px"
              }}>
                {info.label}
              </div>
              <p style={{ fontSize: "0.85rem", color: "#666666" }}>{info.msg}</p>
            </div>
            <div className="preview-divider" />
            <div className="receipt-rows">
              <div className="receipt-row">
                <span className="rr-label">Order ID</span>
                <span className="rr-val">#{orderId}</span>
              </div>
              <div className="receipt-row">
                <span className="rr-label">Placed At</span>
                <span className="rr-val">{new Date(status.created_at).toLocaleTimeString()}</span>
              </div>
              {status.finished_at && (
                <div className="receipt-row">
                  <span className="rr-label">Finished At</span>
                  <span className="rr-val">{new Date(status.finished_at).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
