# FindDonorsAI — Instructions for Model Modification & Deployment

> Complete guide for modifying the ML model, retraining, deploying to production,
> and scaling the application.

---

## Table of Contents

1. [Model Modification](#1-model-modification)
2. [Retraining the Model](#2-retraining-the-model)
3. [Deployment to Render](#3-deployment-to-render)
4. [Docker Deployment](#4-docker-deployment)
5. [Scaling & Production Hardening](#5-scaling--production-hardening)
6. [Monitoring & Maintenance](#6-monitoring--maintenance)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Model Modification

### 1.1 Change the ML Algorithm

The current model is **CatBoost**. To switch to a different algorithm:

**File:** `backend/pipeline/model.py`

```python
# Option A: XGBoost
from xgboost import XGBClassifier

def build_model():
    return XGBClassifier(
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42,
    )

# Option B: LightGBM
from lightgbm import LGBMClassifier

def build_model():
    return LGBMClassifier(random_state=42, verbose=-1)

# Option C: Random Forest
from sklearn.ensemble import RandomForestClassifier

def build_model():
    return RandomForestClassifier(random_state=42, n_jobs=-1)
```

> **Important:** If you switch from CatBoost, update `requirements.txt` to include
> the new library, and verify that SHAP's `TreeExplainer` supports your model.
> The fallback in `pipeline.py` will use the model's built-in feature importance
> if SHAP fails.

### 1.2 Modify Hyperparameters

**File:** `backend/pipeline/model.py` — `build_grid_search()` function

**Current grid (60 combinations x 5 folds = 300 fits):**
```python
param_grid = {
    "iterations": [100, 300, 500],
    "depth": [2, 4, 6, 7],
    "learning_rate": [0.03, 0.05, 0.01, 0.001, 0.1],
}
```

**Expanded grid for better performance:**
```python
param_grid = {
    "iterations": [300, 500, 700, 1000],
    "depth": [4, 6, 7, 8, 10],
    "learning_rate": [0.01, 0.03, 0.05, 0.1],
    "l2_leaf_reg": [1, 3, 5, 7],
    "border_count": [32, 64, 128],
    "bagging_temperature": [0, 0.5, 1],
}
```

> **Warning:** Larger grids increase training time exponentially.
> Consider using `RandomizedSearchCV` for large search spaces.

### 1.3 Switch to RandomizedSearchCV

**File:** `backend/pipeline/model.py`

```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import uniform, randint

def build_grid_search(model=None, n_iter=100):
    if model is None:
        model = build_model()

    param_distributions = {
        "iterations": randint(100, 1000),
        "depth": randint(2, 10),
        "learning_rate": uniform(0.001, 0.15),
        "l2_leaf_reg": uniform(1, 9),
        "border_count": [32, 64, 128, 254],
        "bagging_temperature": uniform(0, 1),
    }

    return RandomizedSearchCV(
        estimator=model,
        param_distributions=param_distributions,
        n_iter=n_iter,
        cv=5,
        scoring="f1",
        n_jobs=-1,
        verbose=1,
        refit=True,
        random_state=42,
    )
```

### 1.4 Change the Scoring Metric

**File:** `backend/pipeline/model.py` — `build_grid_search()` function

```python
# Available options:
scoring = "f1"           # Current default (harmonic mean of P & R)
scoring = "accuracy"     # Simple accuracy
scoring = "precision"    # Minimize false positives
scoring = "recall"       # Minimize false negatives
scoring = "roc_auc"      # Area under ROC curve

# Custom F-beta (emphasize precision):
from sklearn.metrics import make_scorer, fbeta_score
scoring = make_scorer(fbeta_score, beta=0.5)
```

### 1.5 Modify SMOTE / Class Balancing

**File:** `backend/pipeline/train.py`

```python
from imblearn.over_sampling import SMOTE, ADASYN, BorderlineSMOTE

# Option A: Custom SMOTE ratio
smote = SMOTE(random_state=42, sampling_strategy=0.8, k_neighbors=5)

# Option B: Borderline SMOTE
smote = BorderlineSMOTE(random_state=42, kind="borderline-1")

# Option C: ADASYN (adaptive)
smote = ADASYN(random_state=42)

# Option D: No oversampling — use CatBoost class weights instead
# In model.py, change build_model():
model = CatBoostClassifier(auto_class_weights="Balanced", random_seed=42, verbose=0)
```

### 1.6 Add Feature Engineering

**File:** `backend/pipeline/preprocessing.py`

Add a feature engineering step before the ColumnTransformer:

```python
def engineer_features(df):
    """Add engineered features."""
    df["capital-net"] = df["capital-gain"] - df["capital-loss"]
    df["age-group"] = pd.cut(
        df["age"], bins=[0, 25, 35, 50, 65, 100],
        labels=["young", "early-career", "mid-career", "senior", "retired"]
    )
    return df
```

> **Important:** After adding features, update `NUMERICAL_FEATURES` and/or
> `CATEGORICAL_FEATURES` lists, then retrain from scratch.

### 1.7 Modify Feature Columns

**File:** `backend/pipeline/preprocessing.py`

```python
NUMERICAL_FEATURES = [
    "age", "education-num", "capital-gain", "capital-loss", "hours-per-week",
    # Add new numerical features here
]

CATEGORICAL_FEATURES = [
    "workclass", "education_level", "marital-status", "occupation",
    "relationship", "race", "sex", "native-country",
    # Add new categorical features here
]
```

> **Critical:** The preprocessor expects exact column order. Any change requires
> a full retrain (`python pipeline/pipeline.py`).

---

## 2. Retraining the Model

### Quick Retrain (Same Config)

```bash
cd backend
python pipeline/pipeline.py
```

This will:
1. Load and preprocess `data/census.csv`
2. Split 80/20 (stratified)
3. Apply SMOTE on training data only
4. Run GridSearchCV
5. Save all artifacts to `backend/models/`
6. Generate SHAP feature importance
7. Compute evaluation metrics

**Expected runtime:** 10-20 minutes depending on hardware.

### Verify After Retraining

```bash
# 1. Check new metrics
cat backend/models/metrics.json        # Linux/macOS
type backend\models\metrics.json       # Windows

# 2. Test prediction via API
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"age":50,"workclass":"Self-emp-inc","education_level":"Masters","education-num":14,"marital-status":"Married-civ-spouse","occupation":"Exec-managerial","relationship":"Husband","race":"White","sex":"Male","capital-gain":15000,"capital-loss":0,"hours-per-week":55,"native-country":"United-States"}'

# 3. Restart Flask to load new model
# (Ctrl+C, then python app.py)
```

### Artifacts Generated

| File                       | Description                        |
|----------------------------|------------------------------------|
| `model.joblib`             | Trained CatBoost model             |
| `preprocessor.joblib`      | Fitted ColumnTransformer           |
| `feature_names.joblib`     | Post-OHE feature names (103)       |
| `metrics.json`             | Evaluation metrics (Acc/P/R/F1)    |
| `feature_importance.json`  | SHAP values (sorted descending)    |
| `data_summary.json`        | Dataset statistics                 |

---

## 3. Deployment to Render

### 3.1 Backend Deployment (Web Service)

1. **Create a new Web Service** on [Render](https://render.com)
2. **Connect** your GitHub repository (`Eng-AhmedWael1011/P2`)
3. **Configure:**

| Setting          | Value                              |
|------------------|------------------------------------|
| Name             | `finddonorsai-api`                 |
| Root Directory   | `backend`                          |
| Environment      | Python 3                           |
| Build Command    | `pip install -r requirements.txt`  |
| Start Command    | `gunicorn app:app`                 |
| Instance Type    | Free or Starter                    |

4. **Environment Variables:**

| Key            | Value                                        |
|----------------|----------------------------------------------|
| `FLASK_ENV`    | `production`                                 |
| `FLASK_DEBUG`  | `0`                                          |
| `MODEL_PATH`   | `models`                                     |
| `DATA_PATH`    | `../data`                                    |
| `CORS_ORIGINS` | `https://your-frontend-url.onrender.com`     |

5. Click **Deploy**

> **Note:** Ensure `backend/models/` directory with trained artifacts is committed
> to the repository. If omitted, add `python pipeline/pipeline.py &&` before
> `pip install` in the build command (this will retrain on every deploy).

### 3.2 Frontend Deployment (Static Site)

1. **Create a new Static Site** on Render
2. **Connect** the same GitHub repository
3. **Configure:**

| Setting            | Value                              |
|--------------------|------------------------------------|
| Name               | `finddonorsai-web`                 |
| Root Directory     | `frontend`                         |
| Build Command      | `npm install && npm run build`     |
| Publish Directory  | `dist`                             |

4. **Environment Variables:**

| Key            | Value                                        |
|----------------|----------------------------------------------|
| `VITE_API_URL` | `https://finddonorsai-api.onrender.com`      |

5. Click **Deploy**

### 3.3 Post-Deployment Verification

```bash
# 1. Health check
curl https://finddonorsai-api.onrender.com/

# 2. Test prediction
curl -X POST https://finddonorsai-api.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{"age":35,"workclass":"Private","education_level":"Bachelors","education-num":13,"marital-status":"Never-married","occupation":"Prof-specialty","relationship":"Not-in-family","race":"White","sex":"Male","capital-gain":0,"capital-loss":0,"hours-per-week":40,"native-country":"United-States"}'

# 3. Check metrics
curl https://finddonorsai-api.onrender.com/metrics
```

---

## 4. Docker Deployment

### 4.1 Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]
```

### 4.2 Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 4.3 Docker Compose

Create `docker-compose.yml` at project root:

```yaml
version: "3.8"
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - FLASK_DEBUG=0
      - MODEL_PATH=models
      - DATA_PATH=../data
      - CORS_ORIGINS=http://localhost:3000
    volumes:
      - ./data:/app/../data:ro

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: http://localhost:5000
    ports:
      - "3000:80"
    depends_on:
      - backend
```

### 4.4 Run with Docker

```bash
docker-compose up --build
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

---

## 5. Scaling & Production Hardening

### 5.1 Gunicorn Workers

Increase workers for multi-core utilization:

```bash
# Procfile
web: gunicorn app:app --workers 4 --threads 2 --timeout 120
```

**Rule of thumb:** `workers = 2 * CPU_cores + 1`

### 5.2 API Rate Limiting

Add `flask-limiter` for rate limiting:

```bash
pip install Flask-Limiter
```

```python
# In app.py
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(get_remote_address, app=flask_app, default_limits=["100 per minute"])
```

### 5.3 Response Caching

Cache static endpoints (metrics, data-summary, feature-importance):

```bash
pip install Flask-Caching
```

```python
# In app.py
from flask_caching import Cache

cache = Cache(flask_app, config={"CACHE_TYPE": "SimpleCache", "CACHE_DEFAULT_TIMEOUT": 3600})

# In routes/metrics.py
@metrics_bp.route("/metrics", methods=["GET"])
@cache.cached()
def get_metrics():
    ...
```

### 5.4 HTTPS & Security Headers

For production, add security headers:

```python
# In app.py
@flask_app.after_request
def set_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

### 5.5 Logging

Add structured logging:

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)
```

---

## 6. Monitoring & Maintenance

### 6.1 Health Check Monitoring

Set up uptime monitoring (e.g., UptimeRobot, Render's built-in) to ping `GET /` periodically.

### 6.2 Model Drift Detection

Periodically compare new predictions against known baselines:

```python
# Quick drift check script
import requests
import json

test_cases = [
    # Known >50K profile
    {"age":50,"workclass":"Self-emp-inc","education_level":"Masters",
     "education-num":14,"marital-status":"Married-civ-spouse",
     "occupation":"Exec-managerial","relationship":"Husband",
     "race":"White","sex":"Male","capital-gain":15000,
     "capital-loss":0,"hours-per-week":55,"native-country":"United-States"},
]

for case in test_cases:
    r = requests.post("http://localhost:5000/predict", json=case)
    result = r.json()
    print(f"Prediction: {result['prediction']} | Prob: {result['probability']}")
```

### 6.3 Retraining Schedule

- **Monthly:** Check if model performance has degraded
- **Quarterly:** Retrain with accumulated new data
- **On demand:** After feature engineering changes

---

## 7. Troubleshooting

### Common Issues

| Issue                              | Solution                                           |
|------------------------------------|----------------------------------------------------|
| `Model not found`                  | Run `python pipeline/pipeline.py` to train         |
| `ModuleNotFoundError`              | Run `pip install -r requirements.txt`              |
| CORS errors in browser             | Set `CORS_ORIGINS` to your frontend URL            |
| Predictions always same class      | Check SMOTE config; verify class balance in data   |
| `npm run build` fails              | Run `npm install` first; check Node.js version     |
| Gunicorn timeout                   | Increase `--timeout` value in Procfile             |
| Frontend shows "Loading..." forever| Check `VITE_API_URL` matches backend URL           |
| `FileNotFoundError` for census.csv | Verify `DATA_PATH` in `.env` is correct            |

### Performance Baseline

| Metric     | Baseline | Target     |
|------------|----------|------------|
| Accuracy   | 85.4%    | > 86%      |
| Precision  | 71.0%    | > 73%      |
| Recall     | 72.0%    | > 74%      |
| F1 Score   | 71.5%    | > 73%      |

Any re-optimization should aim to beat these baselines.

---

*For AI assistant context and coding conventions, see [Claude.md](Claude.md).*
