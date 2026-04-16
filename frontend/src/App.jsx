import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import PredictionPage from "./pages/PredictionPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

/**
 * App — Root component with routing.
 */
export default function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/predict" element={<PredictionPage />} />
          </Routes>
        </main>
        <footer className="app-footer text-center py-3">
          <small className="text-muted">
            © 2025 FindDonorsAI — Census Income Prediction System
          </small>
        </footer>
      </div>
    </Router>
  );
}
