import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import PredictionPage from "./pages/PredictionPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

/**
 * useTheme — Custom hook for theme state with localStorage persistence.
 * Respects system preference on first visit, then remembers user choice.
 */
function useTheme() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("finddonors-theme");
    if (stored) return stored;
    return window.matchMedia?.("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("finddonors-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
}

/**
 * TopBar — Contextual header showing current page breadcrumb.
 */
function TopBar({ onMenuClick }) {
  const location = useLocation();
  const pageName = location.pathname === "/predict" ? "Predict Income" : "Dashboard";

  return (
    <header className="top-bar">
      <button
        className="mobile-menu-btn"
        onClick={onMenuClick}
        aria-label="Toggle navigation menu"
      >
        ☰
      </button>
      <div>
        <span className="top-bar-title">FindDonorsAI / </span>
        <span className="top-bar-breadcrumb">{pageName}</span>
      </div>
    </header>
  );
}

/**
 * AppLayout — Sidebar + main content area layout with theme toggle.
 */
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-wrapper">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <div className="main-area">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/predict" element={<PredictionPage />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <small className="app-footer-text">
            © 2025 FindDonorsAI — Census Income Prediction System
          </small>
        </footer>
      </div>
    </div>
  );
}

/**
 * App — Root component with routing.
 */
export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
