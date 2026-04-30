const ORDER_LABELS = {
  takeaway: { icon: "🛍️", label: "Takeaway" },
  delivery: { icon: "🚴", label: "Delivery" },
  dine_in:  { icon: "🪑", label: "Dine In"  },
};

export default function Receipt({ receipt, onBack }) {
  const isError = !!receipt.error;
  const type = ORDER_LABELS[receipt.order_type] ?? { icon: "🛍️", label: receipt.order_type };

  return (
    <div className="receipt-wrapper">
      <div className="glass receipt-card">
        <div className="receipt-header">
          <div className={`receipt-icon ${isError ? "error" : "success"}`}>
            {isError ? "❌" : "✅"}
          </div>
          <h2>{isError ? "Order Failed" : "Order Confirmed!"}</h2>
          <p>{isError ? receipt.error : "Your order has been placed successfully."}</p>
        </div>

        {!isError && (
          <>
            {receipt.correction_note && (
              <div className="correction-chip">
                <span>✏️</span>
                <span>Some item names were auto-corrected to match our menu.</span>
              </div>
            )}

            <div className="receipt-rows">
              {(receipt.items || []).map((item, i) => (
                <div key={i} className="receipt-row">
                  <span className="rr-label">{item.item_name} x{item.quantity}</span>
                  <span className="rr-val">&#8377;{item.unit_price} &times; {item.quantity} = &#8377;{item.total_for_item}</span>
                </div>
              ))}
              <div className="receipt-row">
                <span className="rr-label">Tracking ID</span>
                <span className="rr-val" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#f97316" }}>{receipt.tracking_id}</span>
              </div>
              <div className="receipt-row">
                <span className="rr-label">Order Type</span>
                <span className="rr-val">{type.icon} {type.label}</span>
              </div>
              {receipt.order_type === "delivery" && receipt.distance && (
                <div className="receipt-row">
                  <span className="rr-label">Distance</span>
                  <span className="rr-val">{receipt.distance} km</span>
                </div>
              )}
              <div className="receipt-row">
                <span className="rr-label"><b>Grand Total</b></span>
                <span className="rr-val price"><b>&#8377;{receipt.grand_total}</b></span>
              </div>
            </div>

            {receipt.ai_message && (
              <div
                className="ai-message-box"
                dangerouslySetInnerHTML={{ __html: receipt.ai_message }}
              />
            )}
          </>
        )}

        <button className="back-btn" onClick={onBack}>← Place Another Order</button>
      </div>
    </div>
  );
}
