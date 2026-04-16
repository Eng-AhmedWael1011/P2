"""
evaluate.py — Model evaluation and metrics computation.

Computes Accuracy, Precision, Recall, F1, F-beta, and Confusion Matrix.
Saves results as JSON.
"""

import os
import json
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    fbeta_score,
    confusion_matrix,
)


def evaluate_model(model, X_test_processed, y_test, output_dir=None):
    """
    Evaluate the trained model on the test set and compute metrics.

    Parameters
    ----------
    model : estimator
        Trained model.
    X_test_processed : array-like
        Preprocessed test features.
    y_test : array-like
        True test labels.
    output_dir : str, optional
        Directory to save the metrics JSON. Defaults to ``backend/models/``.

    Returns
    -------
    dict
        Dictionary of computed metrics.
    """
    if output_dir is None:
        output_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "models",
        )
    os.makedirs(output_dir, exist_ok=True)

    # Predictions
    y_pred = model.predict(X_test_processed)

    # Compute metrics
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    fbeta = fbeta_score(y_test, y_pred, beta=0.5)
    cm = confusion_matrix(y_test, y_pred)

    metrics = {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "fbeta_score": round(float(fbeta), 4),
        "confusion_matrix": cm.tolist(),
    }

    # Save to JSON
    metrics_path = os.path.join(output_dir, "metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"[EVALUATE] Accuracy:  {acc:.4f}")
    print(f"[EVALUATE] Precision: {prec:.4f}")
    print(f"[EVALUATE] Recall:    {rec:.4f}")
    print(f"[EVALUATE] F1 Score:  {f1:.4f}")
    print(f"[EVALUATE] F-beta:    {fbeta:.4f}")
    print(f"[EVALUATE] Confusion Matrix:\n{cm}")
    print(f"[EVALUATE] Metrics saved to {metrics_path}")

    return metrics
