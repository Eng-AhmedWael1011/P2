import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Sidebar — Persistent left-rail navigation with brand, links, theme toggle, and footer.
 * Follows Dashboard design system: cloud-platform aesthetic, semantic HTML, 44px+ touch targets.
 */
export default function Sidebar({ isOpen, onClose, theme, onToggleTheme }) {
  const isDark = theme === "dark";

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? "open" : ""}`} aria-label="Main navigation">
        {/* Brand */}
        <div className="sidebar-header">
          <div className="sidebar-logo" aria-hidden="true">🧠</div>
          <NavLink className="sidebar-brand" to="/" onClick={onClose}>
            FindDonors<span className="sidebar-brand-accent">AI</span>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <span className="sidebar-nav-label">Analytics</span>
          <NavLink
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            to="/"
            end
            onClick={onClose}
            id="nav-dashboard"
          >
            <span className="sidebar-link-icon" aria-hidden="true">📊</span>
            Dashboard
          </NavLink>

          <span className="sidebar-nav-label">Tools</span>
          <NavLink
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            to="/predict"
            onClick={onClose}
            id="nav-predict"
          >
            <span className="sidebar-link-icon" aria-hidden="true">🔮</span>
            Predict Income
          </NavLink>
        </nav>

        {/* Footer with Theme Toggle */}
        <div className="sidebar-footer">
          <div className="theme-toggle-wrapper">
            <span className="theme-toggle-label">
              {isDark ? "Dark Mode" : "Light Mode"}
            </span>
            <button
              className={`theme-toggle ${isDark ? "dark" : "light"}`}
              onClick={onToggleTheme}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              id="theme-toggle-btn"
            >
              <span className="theme-toggle-thumb" aria-hidden="true">
                {isDark ? "🌙" : "☀️"}
              </span>
            </button>
          </div>
          <p className="sidebar-footer-text">
            © 2025 FindDonorsAI
          </p>
        </div>
      </aside>
    </>
  );
}
