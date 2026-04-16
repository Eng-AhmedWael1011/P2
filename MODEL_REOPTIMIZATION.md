# Model Re-Optimization Guide

> Step-by-step instructions for re-training, tuning, and improving
> the CatBoost model used in FindDonorsAI.

---

## 📋 Prerequisites

```bash
cd backend
pip install -r requirements.txt
```

Ensure the dataset exists at `../data/census.csv` relative to the `backend/` directory.

---

## 1. Quick Re-train (Same Configuration)

To re-train the model with the current hyperparameter grid:

```bash
cd backend
python pipeline/pipeline.py
```

This will:
1. Load and preprocess the dataset
2. Apply SMOTE after train/test split
3. Run GridSearchCV with the current parameter grid
4. Save all artifacts to `backend/models/`
5. Generate SHAP feature importance
6. Compute and save evaluation metrics

**Expected runtime**: 10–20 minutes (depending on hardware).

---

## 2. Modify the Hyperparameter Grid

Edit `backend/pipeline/model.py` to adjust the search space:

```python
# Current grid (60 combinations × 5 folds = 300 fits)
param_grid = {
    "iterations": [100, 300, 500],
    "depth": [2, 4, 6, 7],
    "learning_rate": [0.03, 0.05, 0.01, 0.001, 0.1],
}
```

### Suggested Expanded Grid (for better performance)

```python
param_grid = {
    "iterations": [300, 500, 700, 1000],
    "depth": [4, 6, 7, 8, 10],
    "learning_rate": [0.01, 0.03, 0.05, 0.1],
    "l2_leaf_reg": [1, 3, 5, 7],             # L2 regularization
    "border_count": [32, 64, 128],            # Feature splits
    "bagging_temperature": [0, 0.5, 1],       # Bayesian bootstrap
}
```

> ⚠️ **Warning**: Larger grids increase training time exponentially.
> The expanded grid above would produce 4×5×4×4×3×3 = 2,880 combinations
> × 5 folds = 14,400 fits. Consider using `RandomizedSearchCV` instead.

### Switch to RandomizedSearchCV

Edit `backend/pipeline/model.py`:

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

    search = RandomizedSearchCV(
        estimator=model,
        param_distributions=param_distributions,
        n_iter=n_iter,        # Number of random combinations to try
        cv=5,
        scoring="f1",
        n_jobs=-1,
        verbose=1,
        refit=True,
        random_state=42,
    )
    return search
```

---

## 3. Change the Scoring Metric

The current optimization target is **F1 Score**. To change it:

Edit `backend/pipeline/model.py`, `build_grid_search()` function:

```python
# Available scoring options:
scoring = "f1"           # Current default — harmonic mean of precision & recall
scoring = "accuracy"     # Simple accuracy
scoring = "precision"    # Maximize precision (minimize false positives)
scoring = "recall"       # Maximize recall (minimize false negatives)
scoring = "roc_auc"      # Area under ROC curve

# Custom F-beta score (emphasize precision over recall):
from sklearn.metrics import make_scorer, fbeta_score
scoring = make_scorer(fbeta_score, beta=0.5)
```

---

## 4. Adjust SMOTE Parameters

Edit `backend/pipeline/train.py`:

```python
from imblearn.over_sampling import SMOTE, ADASYN, BorderlineSMOTE

# Option A: Standard SMOTE with custom ratio
smote = SMOTE(
    random_state=42,
    sampling_strategy=0.8,  # Target ratio (minority/majority)
    k_neighbors=5,          # Number of nearest neighbors
)

# Option B: Borderline SMOTE (only oversamples near decision boundary)
smote = BorderlineSMOTE(random_state=42, kind="borderline-1")

# Option C: ADASYN (adaptive synthetic sampling — focuses on hard examples)
smote = ADASYN(random_state=42)

# Option D: No oversampling (use class_weight instead)
# In model.py, add to CatBoostClassifier:
model = CatBoostClassifier(
    auto_class_weights="Balanced",  # Built-in CatBoost class weighting
    random_seed=42,
    verbose=0,
)
```

---

## 5. Add Feature Engineering

Edit `backend/pipeline/preprocessing.py` to add new features before the ColumnTransformer:

```python
def engineer_features(df):
    """Add engineered features to improve model performance."""
    # Capital net gain
    df["capital-net"] = df["capital-gain"] - df["capital-loss"]

    # Age bins
    df["age-group"] = pd.cut(
        df["age"], bins=[0, 25, 35, 50, 65, 100],
        labels=["young", "early-career", "mid-career", "senior", "retired"]
    )

    # Hours category
    df["hours-category"] = pd.cut(
        df["hours-per-week"], bins=[0, 20, 40, 60, 100],
        labels=["part-time", "full-time", "overtime", "extreme"]
    )

    return df
```

> ⚠️ Remember to update `NUMERICAL_FEATURES` and `CATEGORICAL_FEATURES` lists
> after adding new columns, and re-train from scratch.

---

## 6. Try Alternative Models

Edit `backend/pipeline/model.py` to try a different model:

```python
# Option A: XGBoost
from xgboost import XGBClassifier
model = XGBClassifier(use_label_encoder=False, eval_metric="logloss", random_state=42)

# Option B: LightGBM
from lightgbm import LGBMClassifier
model = LGBMClassifier(random_state=42, verbose=-1)

# Option C: Ensemble (Voting)
from sklearn.ensemble import VotingClassifier
ensemble = VotingClassifier(
    estimators=[
        ("catboost", CatBoostClassifier(verbose=0)),
        ("xgb", XGBClassifier(use_label_encoder=False, eval_metric="logloss")),
        ("lgbm", LGBMClassifier(verbose=-1)),
    ],
    voting="soft",
)
```

> ⚠️ If you switch from CatBoost, update the SHAP explainer in `pipeline.py`
> accordingly (TreeExplainer works with tree-based models).

---

## 7. Cross-Validation Strategies

Edit `backend/pipeline/model.py` to use stratified K-fold (already default) or
other CV strategies:

```python
from sklearn.model_selection import StratifiedKFold, RepeatedStratifiedKFold

# More robust evaluation with repeated stratified K-fold
cv = RepeatedStratifiedKFold(n_splits=5, n_repeats=3, random_state=42)

grid_search = GridSearchCV(
    estimator=model,
    param_grid=param_grid,
    cv=cv,
    scoring="f1",
    n_jobs=-1,
    verbose=1,
    refit=True,
)
```

---

## 8. After Re-training

After any re-training, verify the new model:

```bash
# 1. Check new metrics
type backend\models\metrics.json

# 2. Check new best params (logged in terminal output)

# 3. Test the API prediction
curl -X POST http://localhost:5000/predict ^
  -H "Content-Type: application/json" ^
  -d "{\"age\":50,\"workclass\":\"Self-emp-inc\",\"education_level\":\"Masters\",\"education-num\":14,\"marital-status\":\"Married-civ-spouse\",\"occupation\":\"Exec-managerial\",\"relationship\":\"Husband\",\"race\":\"White\",\"sex\":\"Male\",\"capital-gain\":15000,\"capital-loss\":0,\"hours-per-week\":55,\"native-country\":\"United-States\"}"

# 4. Restart the Flask server to load the new model
# (Ctrl+C then python app.py)
```

---

## 📊 Current Baseline

| Metric     | Value  | Best Params                                    |
|------------|--------|------------------------------------------------|
| Accuracy   | 85.4%  | depth=7, iterations=300, learning_rate=0.1     |
| Precision  | 71.0%  |                                                |
| Recall     | 72.0%  |                                                |
| F1 Score   | 71.5%  |                                                |
| F-beta     | 71.2%  |                                                |

Any re-optimization should aim to beat these baselines. Track improvements in this table as you experiment.
