# Claude.md — FindDonorsAI Project Context

> This file provides structured context for AI assistants (Claude, Copilot, etc.)
> working on this codebase. It describes the project architecture, conventions,
> and key decisions so that AI-generated edits remain consistent.

---

## 🏗️ Project Overview

**FindDonorsAI** is a full-stack machine learning web application that predicts
whether a person's income exceeds $50K based on the Census "Finding Donors" dataset.

| Layer     | Stack                                              |
|-----------|-----------------------------------------------------|
| ML Model  | CatBoost + GridSearchCV + SMOTE (imbalanced-learn)  |
| Backend   | Flask, flask-cors, gunicorn, SHAP, scikit-learn     |
| Frontend  | React (Vite), Bootstrap 5, D3.js, Axios             |
| Deploy    | Render (Procfile + gunicorn)                        |

---

## 📂 Repository Structure

```
P2/
├── backend/                 # Flask API + ML pipeline
│   ├── app.py               # Entry point (factory pattern, blueprints)
│   ├── config.py            # Env-based configuration
│   ├── Procfile              # Gunicorn for production
│   ├── requirements.txt
│   ├── .env / .env.example
│   ├── routes/              # REST endpoints as Flask Blueprints
│   │   ├── predict.py       # POST /predict
│   │   ├── metrics.py       # GET /metrics
│   │   ├── data_summary.py  # GET /data-summary
│   │   └── feature_importance.py  # GET /feature-importance
│   ├── services/            # Business logic layer
│   │   ├── prediction_service.py
│   │   └── data_service.py
│   ├── pipeline/            # sklearn-compatible ML pipeline
│   │   ├── data_loader.py   # CSV loading + whitespace stripping
│   │   ├── preprocessing.py # ColumnTransformer (MinMaxScaler + OHE)
│   │   ├── model.py         # CatBoost + GridSearchCV definitions
│   │   ├── train.py         # Training orchestration with SMOTE
│   │   ├── evaluate.py      # Metrics computation
│   │   └── pipeline.py      # End-to-end pipeline entry point
│   ├── models/              # Serialized artifacts (.joblib, .json)
│   └── utils/helpers.py     # Artifact loading utilities
│
├── frontend/                # React SPA (Vite)
│   └── src/
│       ├── App.jsx          # Router + layout
│       ├── App.css          # Design system (dark glassmorphism)
│       ├── services/api.js  # Axios API client
│       ├── components/      # Reusable UI + D3 chart components
│       └── pages/           # DashboardPage, PredictionPage
│
├── data/census.csv          # Source dataset (39,240 records)
└── README.md
```

---

## 🧪 Key Architectural Decisions

### ML Pipeline
- **SMOTE is applied ONLY after train/test split** — prevents data leakage.
- **ColumnTransformer** handles both numerical (MinMaxScaler) and categorical
  (OneHotEncoder with `handle_unknown='ignore'`) features in a single pipeline.
- **Artifacts are persisted with joblib** — `model.joblib`, `preprocessor.joblib`,
  `feature_names.joblib`, plus JSON files for metrics, SHAP importance, and data summary.
- **SHAP TreeExplainer** is used for model explainability. Falls back to CatBoost's
  built-in feature importance if SHAP fails.

### Backend Architecture
- **Application factory pattern** — `create_app()` in `app.py`.
- **Blueprints** — Each endpoint is its own Blueprint for modularity.
- **Model loaded once at startup** — stored in `app.config['MODEL']` to avoid
  re-loading on every request.
- **All paths are relative** — no hardcoded absolute paths, keeps it Render-compatible.

### Frontend Architecture
- **React Router** — SPA with `/` (Dashboard) and `/predict` (Prediction) routes.
- **D3.js** integrated into React via `useRef` + `useEffect` — charts are imperatively
  drawn inside React lifecycle hooks.
- **Bootstrap 5** for layout, **custom CSS** for the dark glassmorphism theme.
- **API calls centralized** in `services/api.js` using Axios.

---

## 🎨 CSS Convention

The project uses a **dark theme with glassmorphism**. Key rules:

1. **All colors come from CSS custom properties** (`:root` variables).
2. **Bootstrap's default dark text is overridden** — headings, paragraphs, labels,
   and `.text-muted` are all forced to light colors via `!important`.
3. **`.glass-card`** is the primary container class — semi-transparent bg + blur + border.
4. **`.gradient-text`** uses `background-clip: text` for multi-color headings.
5. **Never use Bootstrap's default text color classes** without verifying visibility
   against the dark background.

---

## ⚙️ Environment Variables

| Variable       | Default     | Description                      |
|----------------|-------------|----------------------------------|
| `FLASK_ENV`    | production  | Flask environment                |
| `FLASK_DEBUG`  | 0           | Debug mode (0 = off)             |
| `MODEL_PATH`   | models      | Relative path to model artifacts |
| `DATA_PATH`    | ../data     | Relative path to dataset         |
| `CORS_ORIGINS` | *           | Allowed CORS origins             |
| `VITE_API_URL` | http://localhost:5000 | Backend URL for frontend |

---

## 🧠 Feature Columns

### Numerical (5)
`age`, `education-num`, `capital-gain`, `capital-loss`, `hours-per-week`

### Categorical (8)
`workclass`, `education_level`, `marital-status`, `occupation`, `relationship`,
`race`, `sex`, `native-country`

### Target
`income` → Binary: `>50K` (1) or `<=50K` (0)

---

## 🔄 How to Re-train

```bash
cd backend
python pipeline/pipeline.py
```

This regenerates all artifacts in `backend/models/`:
- `model.joblib` — trained CatBoost model
- `preprocessor.joblib` — fitted ColumnTransformer
- `feature_names.joblib` — post-OHE feature names
- `metrics.json` — evaluation results
- `feature_importance.json` — SHAP values
- `data_summary.json` — dataset statistics

---

## 🚫 Things to Avoid

1. **Don't use absolute paths** — breaks Render deployment.
2. **Don't apply SMOTE before train/test split** — causes data leakage.
3. **Don't import Bootstrap CSS more than once** — already imported in `App.jsx`.
4. **Don't add `debug=True`** in production config — security risk.
5. **Don't modify feature column lists** without retraining — the preprocessor
   expects the exact column order defined in `preprocessing.py`.
