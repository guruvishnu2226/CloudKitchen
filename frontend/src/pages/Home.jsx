import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
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
            <a href="/menu"    className="home-nav-link d-none d-md-inline">Menu</a>
            <a href="/about"   className="home-nav-link d-none d-md-inline">About</a>
            <a href="/contact" className="home-nav-link d-none d-md-inline">Contact</a>
            <button className="home-nav-login" onClick={() => navigate("/login")}>
              Staff Login
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="home-hero">
          <div className="home-hero-top d-flex flex-column flex-lg-row align-items-center justify-content-between">
            <div className="home-hero-content text-center text-lg-start">
              <span className="home-hero-badge">✨ Crafting Cravings Daily</span>
              <h1 className="home-hero-title">
                Where Culinary Tradition<br />Meets the Future
              </h1>
              <p className="home-hero-sub">
                Order smarter. Track in real time. Experience food like never before.
              </p>
              <div className="home-hero-btns d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                <button className="home-btn-primary" onClick={() => navigate("/menu")}>
                  View Menu
                </button>
                <button className="home-btn-secondary" onClick={() => navigate("/about")}>
                  Our Story
                </button>
              </div>
            </div>

            {/* <div className="home-hero-visual d-flex flex-row flex-lg-column gap-3 mt-4 mt-lg-0 col-md-6">
              <div className="home-hero-card">
                <span style={{ fontSize: "3.5rem" }}>🍛</span>
                <p>AI predicts your delivery time</p>
              </div>
              <div className="home-hero-card">
                <span style={{ fontSize: "3.5rem" }}>🤖</span>
                <p>Ask our AI Waiter anything</p>
              </div>
            </div> */}
          </div>

          {/* ── Feature Cards ── */}
          <div className="home-features row g-3 mt-2">
            <div className="col-12 col-md-12">
              <div className="home-feature-card h-100" onClick={() => navigate("/menu")}>
                <span className="home-feature-icon">🍽️</span>
                <h3>Our Menu</h3>
                <p>Explore fresh dishes crafted daily by our chefs</p>
              </div>
            </div>
            <div className="col-12 col-md-12">
              <div className="home-feature-card h-100" onClick={() => navigate("/about")}>
                <span className="home-feature-icon">ℹ️</span>
                <h3>About Us</h3>
                <p>The story behind BiteCraft</p>
              </div>
            </div>
            <div className="col-12 col-md-12">
              <div className="home-feature-card h-100" onClick={() => navigate("/contact")}>
                <span className="home-feature-icon">📞</span>
                <h3>Contact</h3>
                <p>Get in touch with our team</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
