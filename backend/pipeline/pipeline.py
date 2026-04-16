"""
pipeline.py — Full pipeline orchestration.

This is the main entry point for training the model end-to-end.
It orchestrates loading, preprocessing, training, evaluation, and SHAP analysis.
"""

import os
import sys
import json
import numpy as np

# Add the backend directory to the path so imports work when run as a script
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pipeline.data_loader import load_data
from pipeline.preprocessing import prepare_data, get_feature_columns, NUMERICAL_FEATURES, CATEGORICAL_FEATURES
from pipeline.train import train_pipeline
from pipeline.evaluate import evaluate_model


def generate_shap_importance(model, X_test_processed, feature_names, output_dir):
    """
    Generate SHAP-based feature importance and save as JSON.

    Parameters
    ----------
    model : estimator
        Trained CatBoost model.
    X_test_processed : array-like
        Preprocessed test features.
    feature_names : list
        List of feature names after preprocessing.
    output_dir : str
        Directory to save the SHAP results.
    """
    try:
        import shap

        print("[SHAP] Computing SHAP values...")
        explainer = shap.TreeExplainer(model)

        # Use a sample for speed if the test set is large
        sample_size = min(500, X_test_processed.shape[0])
        X_sample = X_test_processed[:sample_size]

        shap_values = explainer.shap_values(X_sample)

        # Mean absolute SHAP values for feature importance
        mean_abs_shap = np.abs(shap_values).mean(axis=0)

        # Create importance dict sorted by importance
        importance = {}
        for name, val in zip(feature_names, mean_abs_shap):
            importance[name] = round(float(val), 6)

        # Sort descending by value
        importance = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))

        # Save the full importance
        shap_path = os.path.join(output_dir, "feature_importance.json")
        with open(shap_path, "w", encoding="utf-8") as f:
            json.dump(importance, f, indent=2)

        print(f"[SHAP] Feature importance saved to {shap_path}")
        print(f"[SHAP] Top 10 features:")
        for i, (name, val) in enumerate(list(importance.items())[:10]):
            print(f"  {i+1}. {name}: {val}")

    except Exception as e:
        print(f"[SHAP] Warning: Could not generate SHAP values: {e}")
        # Save a fallback using CatBoost's built-in feature importance
        try:
            importances = model.get_feature_importance()
            importance = {}
            for name, val in zip(feature_names, importances):
                importance[name] = round(float(val), 6)
            importance = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))
            shap_path = os.path.join(output_dir, "feature_importance.json")
            with open(shap_path, "w", encoding="utf-8") as f:
                json.dump(importance, f, indent=2)
            print(f"[SHAP] Fallback feature importance saved to {shap_path}")
        except Exception as e2:
            print(f"[SHAP] Error generating fallback importance: {e2}")


def generate_data_summary(data_path=None, output_dir=None):
    """
    Generate dataset summary statistics and save as JSON.

    Parameters
    ----------
    data_path : str, optional
        Path to the CSV data file.
    output_dir : str, optional
        Directory to save the summary JSON.
    """
    if output_dir is None:
        output_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "models",
        )

    df = load_data(data_path)
    X, y = prepare_data(df)

    total_records = len(X)
    income_above_50k = int(y.sum())
    income_at_most_50k = total_records - income_above_50k

    # Numerical feature stats
    numerical_stats = {}
    for col in NUMERICAL_FEATURES:
        numerical_stats[col] = {
            "mean": round(float(X[col].mean()), 2),
            "median": round(float(X[col].median()), 2),
            "min": round(float(X[col].min()), 2),
            "max": round(float(X[col].max()), 2),
            "std": round(float(X[col].std()), 2),
        }

    # Categorical feature distributions
    categorical_distributions = {}
    for col in CATEGORICAL_FEATURES:
        dist = X[col].value_counts().to_dict()
        categorical_distributions[col] = {k: int(v) for k, v in dist.items()}

    summary = {
        "total_records": total_records,
        "income_above_50k": income_above_50k,
        "income_at_most_50k": income_at_most_50k,
        "income_above_50k_percent": round(income_above_50k / total_records * 100, 2),
        "numerical_stats": numerical_stats,
        "categorical_distributions": categorical_distributions,
    }

    summary_path = os.path.join(output_dir, "data_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"[DATA] Summary saved to {summary_path}")
    return summary


def run_full_pipeline(data_path=None, output_dir=None):
    """
    Run the complete ML pipeline end-to-end.

    Parameters
    ----------
    data_path : str, optional
        Path to the CSV data file.
    output_dir : str, optional
        Directory to save all artifacts.
    """
    if output_dir is None:
        output_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "models",
        )

    print("=" * 60)
    print("  FINDING DONORS ML PIPELINE")
    print("=" * 60)

    # Step 1: Train
    result = train_pipeline(data_path=data_path, output_dir=output_dir)

    # Step 2: Evaluate
    print("\n" + "-" * 60)
    metrics = evaluate_model(
        result["model"],
        result["X_test_processed"],
        result["y_test"],
        output_dir=output_dir,
    )

    # Step 3: SHAP analysis
    print("\n" + "-" * 60)
    generate_shap_importance(
        result["model"],
        result["X_test_processed"],
        result["feature_names"],
        output_dir=output_dir,
    )

    # Step 4: Data summary
    print("\n" + "-" * 60)
    generate_data_summary(data_path=data_path, output_dir=output_dir)

    print("\n" + "=" * 60)
    print("  PIPELINE COMPLETE!")
    print("=" * 60)

    return result, metrics


if __name__ == "__main__":
    run_full_pipeline()
