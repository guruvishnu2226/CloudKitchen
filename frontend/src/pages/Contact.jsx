import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Contact() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name: "", email: "", message: "" });
  const [success, setSuccess] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSuccess(true);
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <div className="home-shell">
      <div className="home-bg-layer"></div>
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="bg-shape shape-3"></div>
      <div className="bg-bubbles">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bubble-item"></div>
        ))}
      </div>

      <div className="home-glass-board w-100">

        {/* ── Navbar ── */}
        <nav className="home-nav d-flex justify-content-between align-items-center">
          <div className="home-nav-logo d-flex align-items-center gap-2">
            <div className="logo-icon blue-logo">🍳</div>
            <span className="home-nav-brand">BiteCraft</span>
          </div>
          <div className="home-nav-links d-flex align-items-center">
            <a href="/"      className="home-nav-link d-none d-md-inline">Home</a>
            <a href="/menu"  className="home-nav-link d-none d-md-inline">Menu</a>
            <a href="/about" className="home-nav-link d-none d-md-inline">About</a>
            <button className="home-nav-login" onClick={() => navigate("/login")}>
              Staff Login
            </button>
          </div>
        </nav>

        {/* ── Content ── */}
        <section className="home-hero">
          <div className="text-center mb-4">
            <span className="home-hero-badge">Get In Touch</span>
            <h1 className="home-hero-title mt-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
              Contact Us
            </h1>
            <p className="home-hero-sub mx-auto" style={{ maxWidth: "500px" }}>
              Have a question, feedback, or just want to say hello? We'd love to hear from you.
            </p>
          </div>

          <div className="mx-auto w-100" style={{ maxWidth: "560px" }}>
            {success && (
              <div className="text-center mb-3" style={{
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.4)",
                borderRadius: "16px",
                padding: "14px 20px",
                color: "#ffffff",
                fontSize: "0.95rem",
                backdropFilter: "blur(10px)",
              }}>
                ✅ Thanks! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div className="glass-input-wrapper">
                <input
                  className="glass-input"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  style={{ paddingLeft: "20px" }}
                />
              </div>
              <div className="glass-input-wrapper">
                <input
                  className="glass-input"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  style={{ paddingLeft: "20px" }}
                />
              </div>
              <div className="glass-input-wrapper">
                <textarea
                  className="glass-input"
                  placeholder="Write your message here…"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  required
                  rows={5}
                  style={{ paddingLeft: "20px", resize: "vertical", borderRadius: "20px" }}
                />
              </div>
              <button className="glass-submit-btn" type="submit">
                Send Message →
              </button>
            </form>
          </div>
        </section>

      </div>

      <footer className="home-footer">
        <p>© 2026 BiteCraft. All rights reserved.</p>
      </footer>
    </div>
  );
}
