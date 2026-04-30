const CATEGORY_ICONS = {
  "Starters":   "🥗",
  "Main Course":"🍛",
  "Breads":     "🫓",
  "Rice":       "🍚",
  "Desserts":   "🍮",
  "Drinks":     "🥤",
  "default":    "🍽️",
};

export default function Menu({ menu, loading, onSelect }) {
  if (loading) {
    return (
      <div className="menu-loading-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="menu-skel" />
        ))}
      </div>
    );
  }

  if (!menu.length) {
    return (
      <div className="menu-error">
        <span>😕</span>
        <p>Could not load menu. Is the backend running?</p>
      </div>
    );
  }

  const categories = [...new Set(menu.map(i => i.category))];

  return (
    <div className="menu-wrap">
      <div className="menu-stats-row">
        <div className="menu-stat">
          <span className="menu-stat-num">{menu.length}</span>
          <span className="menu-stat-lbl">Dishes</span>
        </div>
        <div className="menu-stat-divider" />
        <div className="menu-stat">
          <span className="menu-stat-num">{categories.length}</span>
          <span className="menu-stat-lbl">Categories</span>
        </div>
        <div className="menu-stat-divider" />
        <div className="menu-stat">
          <span className="menu-stat-num">15m</span>
          <span className="menu-stat-lbl">Avg. Ready</span>
        </div>
      </div>

      {categories.map(cat => (
        <div key={cat} className="menu-category">
          <div className="menu-cat-header">
            <span className="menu-cat-icon">{CATEGORY_ICONS[cat] ?? CATEGORY_ICONS.default}</span>
            <span className="menu-cat-name">{cat}</span>
            <span className="menu-cat-count">{menu.filter(i => i.category === cat).length} items</span>
          </div>
          <div className="menu-grid">
            {menu.filter(i => i.category === cat).map(item => (
              <div key={item.item_name} className="menu-card" onClick={() => onSelect(item.item_name)}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.item_name} className="menu-card-img" />
                  : <span className="menu-card-emoji">🍴</span>
                }
                <span className="menu-card-name">{item.item_name}</span>
                <span className="menu-card-price">₹{item.price}</span>
                <span className="menu-card-cta">Tap to order</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
