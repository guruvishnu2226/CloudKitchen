import { useState, useRef, useEffect } from "react";
import axios from "axios";

const SUGGESTIONS = [
  "What's on the menu?",
  "How long for delivery 5km away?",
  "What are your best starters?",
  "Do you have vegetarian options?",
];

export default function AiWaiter({ api }) {
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    const query = text ?? input.trim();
    if (!query || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: query }]);
    setLoading(true);
    try {
      const res = await axios.post(`${api}/api/ask_waiter`, { user_message: query });
      setMessages(prev => [...prev, { role: "ai", text: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Sorry, the AI waiter is offline right now." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="chat-layout">
      <div className="chat-window">
        {messages.length === 0 && !loading && (
          <div className="chat-empty">
            <span className="ce-icon">🤖</span>
            <h3>Your AI Waiter is ready</h3>
            <p>Ask about the menu, prices, or delivery times.</p>
            <div className="chat-suggestions">
              {SUGGESTIONS.map(s => (
                <span key={s} className="suggestion-chip" onClick={() => send(s)}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            <div className="msg-meta">
              {msg.role === "ai" ? "🤖 AI Waiter" : "You"}
            </div>
            <div className="bubble">{msg.text}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-msg ai">
            <div className="msg-meta">🤖 AI Waiter</div>
            <div className="bubble typing-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        <input
          className="chat-input"
          placeholder="Ask about the menu, delivery time…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={() => send()}
          disabled={loading || !input.trim()}
        >
          Send ↑
        </button>
      </div>
    </div>
  );
}
