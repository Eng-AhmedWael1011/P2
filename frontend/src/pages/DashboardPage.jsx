import React, { useState, useEffect } from "react";
import { getDataSummary, getMetrics, getFeatureImportance } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";
import OverviewTab from "../components/OverviewTab";
import ModelPerformanceTab from "../components/ModelPerformanceTab";
import ConfusionMatrixTab from "../components/ConfusionMatrixTab";
import FeatureImportanceTab from "../components/FeatureImportanceTab";

/**
 * DashboardPage — Main dashboard with tabbed sections.
 */
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dataSummary, setDataSummary] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [importance, setImportance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, metricsRes, importanceRes] = await Promise.all([
        getDataSummary(),
        getMetrics(),
        getFeatureImportance(),
      ]);
      setDataSummary(summaryRes);
      setMetrics(metricsRes);
      setImportance(importanceRes);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "performance", label: "Model Performance", icon: "⚡" },
    { id: "confusion", label: "Confusion Matrix", icon: "🔢" },
    { id: "importance", label: "Feature Importance", icon: "🧬" },
  ];

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="text-center mb-4">
        <h1 className="page-title">
          <span className="gradient-text">Analytics Dashboard</span>
        </h1>
        <p className="text-muted">Census Income Prediction Model Insights</p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <LoadingSpinner message="Loading dashboard data..." />
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="d-flex justify-content-center mb-4">
            <div className="tab-nav-container">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="me-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content-area">
            {activeTab === "overview" && <OverviewTab data={dataSummary} />}
            {activeTab === "performance" && <ModelPerformanceTab metrics={metrics} />}
            {activeTab === "confusion" && <ConfusionMatrixTab metrics={metrics} />}
            {activeTab === "importance" && <FeatureImportanceTab importance={importance} />}
          </div>
        </>
      )}
    </div>
  );
}
