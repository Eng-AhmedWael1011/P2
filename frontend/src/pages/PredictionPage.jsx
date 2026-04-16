import React, { useState } from "react";
import { predictIncome } from "../services/api";
import ErrorAlert from "../components/ErrorAlert";

const CATEGORICAL_OPTIONS = {
  workclass: ["Private", "Self-emp-not-inc", "Self-emp-inc", "Federal-gov", "Local-gov", "State-gov", "Without-pay", "Never-worked"],
  education_level: ["Bachelors", "Some-college", "11th", "HS-grad", "Prof-school", "Assoc-acdm", "Assoc-voc", "9th", "7th-8th", "12th", "Masters", "1st-4th", "10th", "Doctorate", "5th-6th", "Preschool"],
  "marital-status": ["Married-civ-spouse", "Divorced", "Never-married", "Separated", "Widowed", "Married-spouse-absent", "Married-AF-spouse"],
  occupation: ["Tech-support", "Craft-repair", "Other-service", "Sales", "Exec-managerial", "Prof-specialty", "Handlers-cleaners", "Machine-op-inspct", "Adm-clerical", "Farming-fishing", "Transport-moving", "Priv-house-serv", "Protective-serv", "Armed-Forces"],
  relationship: ["Wife", "Own-child", "Husband", "Not-in-family", "Other-relative", "Unmarried"],
  race: ["White", "Asian-Pac-Islander", "Amer-Indian-Eskimo", "Other", "Black"],
  sex: ["Female", "Male"],
  "native-country": ["United-States", "Cambodia", "England", "Puerto-Rico", "Canada", "Germany", "India", "Japan", "Greece", "South", "China", "Cuba", "Iran", "Honduras", "Philippines", "Italy", "Poland", "Jamaica", "Vietnam", "Mexico", "Portugal", "Ireland", "France", "Dominican-Republic", "Laos", "Ecuador", "Taiwan", "Haiti", "Columbia", "Hungary", "Guatemala", "Nicaragua", "Scotland", "Thailand", "Yugoslavia", "El-Salvador", "Peru", "Hong", "Holand-Netherlands"],
};

const INITIAL_FORM = {
  age: 35,
  workclass: "Private",
  education_level: "Bachelors",
  "education-num": 13,
  "marital-status": "Never-married",
  occupation: "Prof-specialty",
  relationship: "Not-in-family",
  race: "White",
  sex: "Male",
  "capital-gain": 0,
  "capital-loss": 0,
  "hours-per-week": 40,
  "native-country": "United-States",
};

const FIELD_LABELS = {
  age: "Age",
  workclass: "Work Class",
  education_level: "Education Level",
  "education-num": "Years of Education",
  "marital-status": "Marital Status",
  occupation: "Occupation",
  relationship: "Relationship",
  race: "Race",
  sex: "Sex",
  "capital-gain": "Capital Gain ($)",
  "capital-loss": "Capital Loss ($)",
  "hours-per-week": "Hours per Week",
  "native-country": "Native Country",
};

/**
 * PredictionPage — Interactive form for income prediction.
 * Dashboard design system: modular grid, glass panels, accessible form inputs.
 */
export default function PredictionPage() {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const prediction = await predictIncome(form);
      setResult(prediction);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ ...INITIAL_FORM });
    setResult(null);
    setError(null);
  };

  const numericalFields = ["age", "education-num", "capital-gain", "capital-loss", "hours-per-week"];
  const categoricalFields = Object.keys(CATEGORICAL_OPTIONS);

  const isPositive = result?.prediction === ">50K";

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          <span className="gradient-text">Income Prediction</span>
        </h1>
        <p className="page-subtitle">Enter personal details to predict income category</p>
      </div>

      <div className="prediction-layout">
        {/* Form Panel */}
        <div className="glass-card chart-panel animate-in">
          <div className="chart-panel-header">
            <h3 className="chart-panel-title">👤 Personal Information</h3>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Numerical Fields */}
            <div className="grid-form" style={{ marginBottom: "var(--space-4)" }}>
              {numericalFields.map((field) => (
                <div className="form-group" key={field}>
                  <label className="form-label" htmlFor={`input-${field}`}>
                    {FIELD_LABELS[field]}
                  </label>
                  <input
                    type="number"
                    className="form-control form-input"
                    value={form[field]}
                    onChange={(e) => handleChange(field, parseFloat(e.target.value) || 0)}
                    id={`input-${field}`}
                    style={{ width: "100%" }}
                  />
                </div>
              ))}
            </div>

            {/* Categorical Fields */}
            <div className="grid-form" style={{ marginBottom: "var(--space-6)" }}>
              {categoricalFields.map((field) => (
                <div className="form-group" key={field}>
                  <label className="form-label" htmlFor={`select-${field}`}>
                    {FIELD_LABELS[field]}
                  </label>
                  <select
                    className="form-select form-input"
                    value={form[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    id={`select-${field}`}
                    style={{ width: "100%" }}
                  >
                    {CATEGORICAL_OPTIONS[field].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <button
                type="submit"
                className="btn-primary-glow"
                disabled={loading}
                id="btn-predict"
                style={{ flex: 1 }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} aria-hidden="true"></div>
                    Predicting...
                  </>
                ) : (
                  "🔮 Predict Income"
                )}
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={handleReset}
                id="btn-reset"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Result Panel */}
        <div>
          <ErrorAlert message={error} onDismiss={() => setError(null)} />

          {result && (
            <div className={`glass-card chart-panel result-card ${isPositive ? "result-positive" : "result-negative"}`}>
              <div style={{ textAlign: "center" }}>
                <div className="result-icon" style={{ marginBottom: "var(--space-4)" }} aria-hidden="true">
                  {isPositive ? "💰" : "📉"}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)", color: "var(--text-primary)" }}>
                  {isPositive ? "High Income" : "Standard Income"}
                </h3>
                <div style={{ marginBottom: "var(--space-5)" }}>
                  <span className={`result-badge ${isPositive ? "result-badge-positive" : "result-badge-negative"}`}>
                    {result.prediction}
                  </span>
                </div>

                {/* Confidence */}
                <div className="glass-card" style={{ padding: "var(--space-5)", background: "rgba(255,255,255,0.03)" }}>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "var(--space-3)" }}>
                    Confidence
                  </p>
                  <div className="confidence-bar-track" style={{ marginBottom: "var(--space-3)" }}>
                    <div
                      className={`confidence-bar-fill ${isPositive ? "confidence-bar-positive" : "confidence-bar-negative"}`}
                      style={{ width: `${result.probability * 100}%` }}
                    ></div>
                  </div>
                  <h4 style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "var(--text-lg)", marginBottom: "var(--space-1)" }}>
                    {(result.probability * 100).toFixed(1)}%
                  </h4>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                    probability of &gt;50K income
                  </p>
                </div>
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="glass-card empty-state">
              <div className="empty-state-icon" aria-hidden="true">🔮</div>
              <p className="empty-state-text">
                Fill in the form and click <strong>Predict Income</strong> to see results
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
