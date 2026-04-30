import { useState, useRef } from "react";
import axios from "axios";

const ORDER_TYPES = [
  { id: "dine_in",  icon: "🪑", label: "Dine In"  },
  { id: "takeaway", icon: "🛍️", label: "Takeaway" },
  { id: "delivery", icon: "🚴", label: "Delivery" },
];

export default function OrderForm({ api, cart, setCart, onReceipt, menu }) {
  const [orderType,  setOrderType]  = useState("dine_in");
  const [distance,   setDistance]   = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [recording,  setRecording]  = useState(false);
  const [customItem, setCustomItem] = useState("");
  const mediaRef  = useRef(null);
  const chunksRef = useRef([]);

  function addItem(name) {
    if (!name.trim()) return;
    setCart(prev => ({ ...prev, [name.trim()]: (prev[name.trim()] || 0) + 1 }));
    setCustomItem("");
  }

  function changeQty(name, delta) {
    setCart(prev => {
      const next = { ...prev, [name]: (prev[name] || 0) + delta };
      if (next[name] <= 0) delete next[name];
      return next;
    });
  }

  async function toggleVoice() {
    if (recording) { mediaRef.current?.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = e => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        const form = new FormData();
        form.append("audio", blob, "recording.wav");
        try {
          const res = await axios.post(`${api}/api/voice_order`, form);
          if (res.data.transcription) addItem(res.data.transcription);
          else setError(res.data.error || "Could not transcribe audio.");
        } catch {
          setError("Voice order failed. Is the backend running?");
        }
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError("Microphone access denied.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!Object.keys(cart).length) { setError("Your cart is empty!"); return; }
    if (orderType === "delivery" && !distance) { setError("Please enter your distance for delivery."); return; }

    setLoading(true);
    try {
      const res = await axios.post(`${api}/api/order`, {
        cart,
        order_type: orderType,
        distance:   distance || 0,
      });
      onReceipt({ ...res.data, order_type: orderType, distance });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Something went wrong.";
      const title = err.response?.data?.error_title;
      setError(title ? `${title} ${msg}` : msg);
    } finally {
      setLoading(false);
    }
  }

  const cartEntries = Object.entries(cart);
  const selectedTypeLabel = ORDER_TYPES.find(t => t.id === orderType)?.label ?? "";

  // look up price from menu for each cart item
  function getPrice(name) {
    const found = menu.find(m => m.item_name.toLowerCase() === name.toLowerCase());
    return found ? parseFloat(found.price) : null;
  }
  const estimatedTotal = cartEntries.reduce((sum, [name, qty]) => {
    const p = getPrice(name);
    return p != null ? sum + p * qty : sum;
  }, 0);
  const allPricesKnown = cartEntries.length > 0 && cartEntries.every(([name]) => getPrice(name) != null);

  return (
    <form className="order-layout" onSubmit={handleSubmit}>
      {/* ── Left: form ── */}
      <div className="glass form-card">
        {error && (
          <div className="error-banner">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Add Item</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              className="form-input"
              placeholder="e.g. Butter Chicken, Naan…"
              value={customItem}
              onChange={e => setCustomItem(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addItem(customItem); } }}
              style={{ flex: 1 }}
            />
            <button type="button" className="order-type-btn" onClick={() => addItem(customItem)}>+ Add</button>
            <button
              type="button"
              className={`order-type-btn ${recording ? "selected" : ""}`}
              onClick={toggleVoice}
              title={recording ? "Stop recording" : "Voice order"}
            >
              {recording ? "⏹️" : "🎙️"}
            </button>
          </div>
        </div>

        {cartEntries.length > 0 && (
          <div className="form-group">
            <label className="form-label">Your Cart</label>
            {cartEntries.map(([name, qty]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ flex: 1 }}>{name}</span>
                <button type="button" className="order-type-btn" style={{ minWidth: "32px" }} onClick={() => changeQty(name, -1)}>−</button>
                <span style={{ minWidth: "20px", textAlign: "center" }}>{qty}</span>
                <button type="button" className="order-type-btn" style={{ minWidth: "32px" }} onClick={() => changeQty(name, 1)}>+</button>
              </div>
            ))}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Order Type</label>
          <div className="order-type-grid">
            {ORDER_TYPES.map(t => (
              <button
                key={t.id}
                type="button"
                className={`order-type-btn ${orderType === t.id ? "selected" : ""}`}
                onClick={() => { setOrderType(t.id); setDistance(""); setError(""); }}
              >
                <span className="ot-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {orderType === "delivery" && (
          <div className="form-group">
            <label className="form-label">Your Distance</label>
            <div className="distance-wrapper">
              <input
                className="form-input"
                type="number"
                min="0.1"
                max="15"
                step="0.1"
                placeholder="e.g. 3.5"
                value={distance}
                onChange={e => setDistance(e.target.value)}
              />
              <span className="distance-unit">km</span>
            </div>
          </div>
        )}

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? "Placing Order…" : "Place Order →"}
        </button>
      </div>

      {/* ── Right: preview ── */}
      <div className="glass order-preview">
        <p className="preview-title">Order Preview</p>
        {cartEntries.length > 0 ? (
          <>
            {cartEntries.map(([name, qty]) => {
              const price = getPrice(name);
              return (
                <div key={name} className="preview-row">
                  <span>{name} x{qty}</span>
                  <span className="val">
                    {price != null ? `₹${(price * qty).toFixed(2)}` : "—"}
                  </span>
                </div>
              );
            })}
            <div className="preview-divider" />
            {allPricesKnown && (
              <div className="preview-row" style={{ fontWeight: 700 }}>
                <span style={{ color: "#1a1a1a" }}>Estimated Total</span>
                <span style={{ color: "#f97316", fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.05rem" }}>
                  ₹{estimatedTotal.toFixed(2)}
                </span>
              </div>
            )}
            <div className="preview-divider" />
            <span className="preview-type-badge">
              {ORDER_TYPES.find(t => t.id === orderType)?.icon} {selectedTypeLabel}
            </span>
            {orderType === "delivery" && (
              <div className="preview-row" style={{ marginTop: "10px" }}>
                <span>Distance</span>
                <span className="val">{distance ? `${distance} km` : "—"}</span>
              </div>
            )}
          </>
        ) : (
          <div className="preview-empty">
            <span className="pe-icon">🍽️</span>
            <p>Add dishes to see your order preview</p>
          </div>
        )}
      </div>
    </form>
  );
}
