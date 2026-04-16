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

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h1 className="page-title">
          <span className="gradient-text">Income Prediction</span>
        </h1>
        <p className="text-muted">Enter personal details to predict income category</p>
      </div>

      <div className="row g-4">
        {/* Form */}
        <div className="col-lg-7">
          <div className="glass-card p-4">
            <h5 className="card-title mb-4">👤 Personal Information</h5>
            <form onSubmit={handleSubmit}>
              {/* Numerical Fields */}
              <div className="row g-3 mb-3">
                {numericalFields.map((field) => (
                  <div className="col-md-6" key={field}>
                    <label className="form-label text-muted small">{FIELD_LABELS[field]}</label>
                    <input
                      type="number"
                      className="form-control form-input"
                      value={form[field]}
                      onChange={(e) => handleChange(field, parseFloat(e.target.value) || 0)}
                      id={`input-${field}`}
                    />
                  </div>
                ))}
              </div>

              {/* Categorical Fields */}
              <div className="row g-3 mb-4">
                {categoricalFields.map((field) => (
                  <div className="col-md-6" key={field}>
                    <label className="form-label text-muted small">{FIELD_LABELS[field]}</label>
                    <select
                      className="form-select form-input"
                      value={form[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      id={`select-${field}`}
                    >
                      {CATEGORICAL_OPTIONS[field].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="d-flex gap-3">
                <button
                  type="submit"
                  className="btn btn-primary-glow flex-grow-1 py-2"
                  disabled={loading}
                  id="btn-predict"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Predicting...
                    </>
                  ) : (
                    "🔮 Predict Income"
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2"
                  onClick={handleReset}
                  id="btn-reset"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Result Panel */}
        <div className="col-lg-5">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />

          {result && (
            <div className={`glass-card p-4 result-card ${result.prediction === ">50K" ? "result-positive" : "result-negative"}`}>
              <div className="text-center">
                <div className="result-icon mb-3">
                  {result.prediction === ">50K" ? "💰" : "📉"}
                </div>
                <h3 className="mb-1 fw-bold">
                  {result.prediction === ">50K" ? "High Income" : "Standard Income"}
                </h3>
                <h2 className={`display-5 fw-bold mb-3 ${result.prediction === ">50K" ? "text-accent" : ""}`} style={result.prediction !== ">50K" ? {color: "#6366f1"} : {}}>
                  {result.prediction}
                </h2>
                <div className="glass-card p-3 mt-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <small className="text-muted d-block mb-1">Confidence</small>
                  <div className="progress mb-2" style={{ height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.1)" }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${result.probability * 100}%`,
                        background: result.prediction === ">50K"
                          ? "linear-gradient(90deg, #06b6d4, #10b981)"
                          : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>
                  <h4 className="mb-0 fw-bold">{(result.probability * 100).toFixed(1)}%</h4>
                  <small className="text-muted">probability of &gt;50K income</small>
                </div>
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="glass-card p-5 text-center h-100 d-flex flex-column justify-content-center align-items-center">
              <div style={{ fontSize: "4rem", opacity: 0.3 }}>🔮</div>
              <p className="text-muted mt-3">Fill in the form and click<br /><strong>Predict Income</strong> to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
