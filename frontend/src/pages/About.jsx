import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function About() {
  const navigate = useNavigate();

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
            <a href="/"        className="home-nav-link d-none d-md-inline">Home</a>
            <a href="/menu"    className="home-nav-link d-none d-md-inline">Menu</a>
            <a href="/contact" className="home-nav-link d-none d-md-inline">Contact</a>
            <button className="home-nav-login" onClick={() => navigate("/login")}>
              Staff Login
            </button>
          </div>
        </nav>

        {/* ── Content ── */}
        <section className="home-hero">
          <div className="text-center mb-4">
            <span className="home-hero-badge">Our Story</span>
            <h1 className="home-hero-title mt-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
              About BiteCraft
            </h1>
            <p className="home-hero-sub mx-auto" style={{ maxWidth: "600px" }}>
              Welcome to BiteCraft, where culinary tradition meets the future of dining.
              We aren't just a kitchen — we are a tech-driven food experience designed for the modern world.
            </p>
          </div>

          <div className="home-features row g-3 mb-4">
            <div className="col-12 col-md-12">
              <div className="home-feature-card h-100">
                <span className="home-feature-icon">📖</span>
                <h3>Our Story</h3>
                <p>
                  Founded in 2026, our mission started with a simple question: Why is food delivery so
                  unpredictable? We built a kitchen from the ground up using Machine Learning to give
                  exact arrival times and AI to make ordering as simple as a conversation.
                </p>
              </div>
            </div>
            <div className="col-12 col-md-12">
              <div className="home-feature-card h-100">
                <span className="home-feature-icon">🌿</span>
                <h3>Our Quality</h3>
                <p>
                  Behind the code is a team of passionate chefs. We use only farm-fresh ingredients and
                  traditional techniques to prepare dishes like our signature Mushroom Risotto and
                  Butter Chicken.
                </p>
              </div>
            </div>
            <div className="col-12 col-md-12">
              <div className="home-feature-card h-100">
                <span className="home-feature-icon">🤖</span>
                <h3>Our Technology</h3>
                <p>
                  Powered by a custom Keras delivery prediction model and a local AI waiter running on
                  Ollama, every interaction is intelligent. From voice ordering to real-time tracking,
                  we bring the future of dining to your table.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button className="home-btn-primary" onClick={() => navigate("/menu")}>
              🍽️ Explore Our Menu
            </button>
          </div>
        </section>

      </div>

      <footer className="home-footer">
        <p>© 2026 BiteCraft. All rights reserved.</p>
      </footer>
    </div>
  );
}
