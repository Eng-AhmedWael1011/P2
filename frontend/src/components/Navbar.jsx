import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Navbar — Top navigation bar with links to Dashboard and Prediction pages.
 */
export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-gradient-primary shadow-lg sticky-top">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
          <span className="brand-icon">🧠</span>
          <span>FindDonors<span className="text-accent">AI</span></span>
        </NavLink>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto gap-1">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 py-2 rounded-pill ${isActive ? "active-link" : ""}`
                }
                to="/"
              >
                📊 Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 py-2 rounded-pill ${isActive ? "active-link" : ""}`
                }
                to="/predict"
              >
                🔮 Predict
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
