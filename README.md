# FindDonorsAI — Census Income Prediction System

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=flat-square&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![CatBoost](https://img.shields.io/badge/CatBoost-1.2-FFCC00?style=flat-square)
![D3.js](https://img.shields.io/badge/D3.js-7-F9A03C?style=flat-square&logo=d3dotjs&logoColor=white)
![License](https://img.shields.io/badge/License-DEPI-blue?style=flat-square)

A **production-ready, full-stack machine learning web application** that predicts whether a person's income exceeds $50K using the Census "Finding Donors" dataset. Built with a modular Flask API backend, CatBoost gradient boosting, and an interactive React + D3.js dashboard.

---

## Overview

FindDonorsAI combines a rigorously trained ML model with a premium dark-themed web interface to deliver real-time income predictions with explainable AI insights. The system processes 13 demographic features through a SMOTE-balanced, GridSearchCV-optimized CatBoost classifier, and provides SHAP-based feature importance analysis.

### Key Highlights

- **CatBoost + GridSearchCV** — Hyperparameter-tuned gradient boosting with 300 grid search combinations
- **SMOTE Balancing** — Applied post-split to prevent data leakage while handling class imbalance
- **SHAP Explainability** — TreeExplainer-based feature importance with fallback to CatBoost native importance
- **Flask REST API** — Modular blueprint architecture with application factory pattern
- **React + D3.js Frontend** — Interactive dashboards with animated donut charts, bar charts, and heatmaps
- **Premium Dark UI** — Glassmorphism design system with smooth micro-animations

---

## Model Performance


| Metric    | Score  |
|-----------|--------|
| Accuracy  | 86.4%  |
| Precision | 74.7%  |
| Recall    | 70.5%  |
| F1 Score  | 72.5%  |
| F-beta    | 73.8%  |

**Best Hyperparameters**: `depth=7, iterations=300, learning_rate=0.1`

---

## Architecture

```
FindDonorsAI
├── backend/                     Flask REST API + ML Pipeline
│   ├── app.py                   Application factory (create_app)
│   ├── config.py                Environment-based configuration
│   ├── Procfile                 Gunicorn deployment descriptor
│   ├── requirements.txt         Python dependencies (pinned)
│   ├── .env.example             Environment template
│   ├── routes/                  API Blueprints
│   │   ├── predict.py           POST /predict
│   │   ├── metrics.py           GET /metrics
│   │   ├── data_summary.py      GET /data-summary
│   │   └── feature_importance.py GET /feature-importance
│   ├── services/                Business Logic Layer
│   │   ├── prediction_service.py  Feature validation + model inference
│   │   └── data_service.py        Dataset summary retrieval
│   ├── pipeline/                ML Pipeline (sklearn-compatible)
│   │   ├── data_loader.py       CSV ingestion + whitespace cleaning
│   │   ├── preprocessing.py     ColumnTransformer (MinMax + OHE)
│   │   ├── model.py             CatBoost + GridSearchCV config
│   │   ├── train.py             Training with SMOTE orchestration
│   │   ├── evaluate.py          Metrics computation (Acc/P/R/F1/Fbeta)
│   │   └── pipeline.py          End-to-end pipeline entry point
│   ├── models/                  Serialized Artifacts
│   │   ├── model.joblib          Trained CatBoost model
│   │   ├── preprocessor.joblib   Fitted ColumnTransformer
│   │   ├── feature_names.joblib  Post-OHE feature names (103)
│   │   ├── metrics.json          Evaluation results
│   │   ├── feature_importance.json SHAP values
│   │   └── data_summary.json     Dataset statistics
│   └── utils/
│       └── helpers.py           Artifact loading utilities
│
├── frontend/                    React SPA (Vite)
│   ├── index.html               SEO-optimized entry point
│   ├── package.json             Node dependencies
│   ├── vite.config.js           Build configuration
│   └── src/
│       ├── App.jsx              Router + layout shell
│       ├── App.css              Design system (dark glassmorphism)
│       ├── services/api.js      Axios API client (centralized)
│       ├── components/          Reusable UI Components
│       │   ├── Navbar.jsx        Navigation with active states
│       │   ├── OverviewTab.jsx   D3 donut chart + stat cards
│       │   ├── ModelPerformanceTab.jsx  D3 bar chart + metric cards
│       │   ├── ConfusionMatrixTab.jsx   D3 heatmap visualization
│       │   ├── FeatureImportanceTab.jsx D3 horizontal bar chart
│       │   ├── LoadingSpinner.jsx       Animated loading state
│       │   └── ErrorAlert.jsx           Dismissible error alerts
│       └── pages/
│           ├── DashboardPage.jsx  Tabbed analytics dashboard
│           └── PredictionPage.jsx Interactive prediction form
│
├── data/
│   └── census.csv               Source dataset (39,240 records, 13 features)
│
├── Claude.md                    AI assistant context document
├── MODEL_REOPTIMIZATION.md      Model tuning guide
├── instructions.md              Deployment & modification guide
└── README.md                    This file
```

---

## Getting Started

### Prerequisites

| Tool       | Version | Purpose              |
|------------|---------|----------------------|
| Python     | 3.10+   | Backend runtime      |
| Node.js    | 18+     | Frontend build tools |
| pip        | Latest  | Python package mgmt  |
| npm        | 9+      | Node package mgmt    |
| Git        | 2.30+   | Version control      |

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Linux/macOS
.\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Train the model (first time only — ~10-20 min)
python pipeline/pipeline.py

# Start the API server
python app.py
```

The API will be available at `http://localhost:5000`.

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Production Build

```bash
cd frontend
npm run build
# Output: frontend/dist/ (ready for static hosting)
```

---

## API Documentation

### Base URL

- **Development**: `http://localhost:5000`
- **Production**: Set via `VITE_API_URL` environment variable

### Endpoints

| Method | Endpoint              | Description                          | Auth |
|--------|-----------------------|--------------------------------------|------|
| GET    | `/`                   | Health check                         | None |
| POST   | `/predict`            | Predict income from features         | None |
| GET    | `/metrics`            | Model evaluation metrics             | None |
| GET    | `/data-summary`       | Dataset summary statistics           | None |
| GET    | `/feature-importance` | SHAP feature importance values       | None |

### POST /predict

**Request:**
```json
{
  "age": 39,
  "workclass": "State-gov",
  "education_level": "Bachelors",
  "education-num": 13,
  "marital-status": "Never-married",
  "occupation": "Adm-clerical",
  "relationship": "Not-in-family",
  "race": "White",
  "sex": "Male",
  "capital-gain": 2174,
  "capital-loss": 0,
  "hours-per-week": 40,
  "native-country": "United-States"
}
```

**Response (200 OK):**
```json
{
  "prediction": "<=50K",
  "probability": 0.1004
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Missing required feature: workclass"
}
```

### GET /metrics

**Response (200 OK):**
```json
{
  "accuracy": 0.8541,
  "precision": 0.7102,
  "recall": 0.7198,
  "f1_score": 0.715,
  "fbeta_score": 0.7121,
  "confusion_matrix": [[5267, 586], [559, 1436]]
}
```

---

## Feature Columns

### Numerical (5)
| Feature           | Description                    | Range        |
|-------------------|--------------------------------|--------------|
| `age`             | Age of the individual          | 17–90        |
| `education-num`   | Years of education completed   | 1–16         |
| `capital-gain`    | Capital gains                  | 0–99,999     |
| `capital-loss`    | Capital losses                 | 0–4,356      |
| `hours-per-week`  | Working hours per week         | 1–99         |

### Categorical (8)
| Feature           | Description                    | Examples                    |
|-------------------|--------------------------------|-----------------------------|
| `workclass`       | Employment type                | Private, Self-emp, Gov      |
| `education_level` | Highest education              | Bachelors, Masters, HS-grad |
| `marital-status`  | Marital status                 | Married, Divorced, Single   |
| `occupation`      | Job type                       | Exec-managerial, Sales      |
| `relationship`    | Family relationship            | Husband, Wife, Own-child    |
| `race`            | Race/ethnicity                 | White, Black, Asian         |
| `sex`             | Gender                         | Male, Female                |
| `native-country`  | Country of origin              | United-States, Mexico       |

### Target
`income` — Binary classification: `>50K` (1) or `<=50K` (0)

---

## Environment Variables

| Variable       | Default                 | Description                          |
|----------------|-------------------------|--------------------------------------|
| `FLASK_ENV`    | `production`            | Flask environment mode               |
| `FLASK_DEBUG`  | `0`                     | Debug mode (0=off, 1=on)             |
| `MODEL_PATH`   | `models`                | Relative path to model artifacts     |
| `DATA_PATH`    | `../data`               | Relative path to dataset directory   |
| `CORS_ORIGINS` | `*`                     | Allowed CORS origins                 |
| `VITE_API_URL` | `http://localhost:5000`  | Backend API URL for frontend         |

---

## Deployment

### Render (Recommended)

See [instructions.md](instructions.md) for detailed step-by-step deployment instructions for both backend and frontend on Render.

**Quick Summary:**
1. **Backend** — Web Service with `gunicorn app:app` start command
2. **Frontend** — Static Site with `npm run build` and `dist/` publish directory

### Docker (Alternative)

See [instructions.md](instructions.md) for Docker containerization setup.

---

## Tech Stack

| Layer      | Technology                                                   |
|------------|--------------------------------------------------------------|
| ML Model   | CatBoost, GridSearchCV, SMOTE (imbalanced-learn)             |
| Backend    | Python, Flask, flask-cors, gunicorn, SHAP, scikit-learn      |
| Frontend   | React 19, Bootstrap 5, D3.js v7, Axios, React Router v7     |
| Build      | Vite 8, ESLint                                               |
| Deploy     | Gunicorn, Render                                             |
| Artifacts  | joblib (model/preprocessor), JSON (metrics/SHAP/summary)     |

---

## Further Documentation

- **[instructions.md](instructions.md)** — Model modification, deployment guides, and scaling strategies
- **[MODEL_REOPTIMIZATION.md](MODEL_REOPTIMIZATION.md)** — Detailed hyperparameter tuning guide
- **[Claude.md](Claude.md)** — AI assistant context for maintaining code consistency

---

## License

This project is part of the **DEPI Machine Learning Engineer Program** (Round 4, AMIT Track).

---

*Built with precision by Ahmed Wael and Hazem Amr

