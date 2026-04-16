"""
train.py — Training logic.

Loads data, splits into train/test, applies SMOTE on training data only,
fits the preprocessing pipeline, runs GridSearchCV, and saves artifacts.
"""

import os
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE

from .data_loader import load_data
from .preprocessing import prepare_data, build_preprocessor
from .model import build_grid_search


def train_pipeline(data_path=None, output_dir=None):
    """
    Execute the full training pipeline.

    Parameters
    ----------
    data_path : str, optional
        Path to the CSV data file.
    output_dir : str, optional
        Directory to save model artifacts. Defaults to ``backend/models/``.

    Returns
    -------
    dict
        A dictionary containing the trained model, preprocessor, feature names,
        and the train/test splits.
    """
    if output_dir is None:
        output_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "models",
        )
    os.makedirs(output_dir, exist_ok=True)

    # 1. Load data
    print("[TRAIN] Loading data...")
    df = load_data(data_path)

    # 2. Prepare features and target
    print("[TRAIN] Preparing features and target...")
    X, y = prepare_data(df)

    # 3. Train/test split (80/20, stratified)
    print("[TRAIN] Splitting data (80/20, stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 4. Fit preprocessor on training data
    print("[TRAIN] Fitting preprocessor...")
    preprocessor = build_preprocessor()
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)

    # 5. Apply SMOTE on training data ONLY
    print("[TRAIN] Applying SMOTE on training data...")
    smote = SMOTE(random_state=42)
    X_train_resampled, y_train_resampled = smote.fit_resample(
        X_train_processed, y_train
    )
    print(f"  Before SMOTE: {np.bincount(y_train)}")
    print(f"  After  SMOTE: {np.bincount(y_train_resampled)}")

    # 6. Train model with GridSearchCV
    print("[TRAIN] Running GridSearchCV (this may take a while)...")
    grid_search = build_grid_search()
    grid_search.fit(X_train_resampled, y_train_resampled)

    best_model = grid_search.best_estimator_
    print(f"[TRAIN] Best params: {grid_search.best_params_}")
    print(f"[TRAIN] Best F1 score (CV): {grid_search.best_score_:.4f}")

    # 7. Get feature names from preprocessor
    feature_names = preprocessor.get_feature_names_out().tolist()

    # 8. Save artifacts
    print("[TRAIN] Saving artifacts...")
    joblib.dump(best_model, os.path.join(output_dir, "model.joblib"))
    joblib.dump(preprocessor, os.path.join(output_dir, "preprocessor.joblib"))
    joblib.dump(feature_names, os.path.join(output_dir, "feature_names.joblib"))

    print("[TRAIN] Training complete!")

    return {
        "model": best_model,
        "preprocessor": preprocessor,
        "feature_names": feature_names,
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
        "X_test_processed": X_test_processed,
        "best_params": grid_search.best_params_,
        "best_score": grid_search.best_score_,
    }
