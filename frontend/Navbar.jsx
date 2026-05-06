import { LogOut } from 'lucide-react';

// Shared navbar used by all pages
// Pass extra buttons (e.g. Back to Shop, cart toggle) as children
export default function Navbar({ username, onLogout, children }) {
  return (
    <nav className="shop-navbar">
      <div className="navbar-inner">
        <div className="logo">
          <span className="logo-icon">🌸</span>
          <div>
            <h1 className="shop-title">Flower Shop</h1>
          </div>
        </div>
        <div className="navbar-right">
          <span className="navbar-user">👤 {username}</span>
          {children}
          <button className="btn-logout" onClick={onLogout} aria-label="Logout">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
