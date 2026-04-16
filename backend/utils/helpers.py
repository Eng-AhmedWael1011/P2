"""
helpers.py — Utility functions for the backend application.
"""

import os
import json
import joblib
from config import Config


def load_model():
    """Load the trained model from disk."""
    model_path = os.path.join(Config.MODEL_DIR, "model.joblib")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}. Run the training pipeline first.")
    return joblib.load(model_path)


def load_preprocessor():
    """Load the fitted preprocessor from disk."""
    preprocessor_path = os.path.join(Config.MODEL_DIR, "preprocessor.joblib")
    if not os.path.exists(preprocessor_path):
        raise FileNotFoundError(f"Preprocessor not found at {preprocessor_path}. Run the training pipeline first.")
    return joblib.load(preprocessor_path)


def load_feature_names():
    """Load the feature names from disk."""
    feature_names_path = os.path.join(Config.MODEL_DIR, "feature_names.joblib")
    if not os.path.exists(feature_names_path):
        raise FileNotFoundError(f"Feature names not found at {feature_names_path}. Run the training pipeline first.")
    return joblib.load(feature_names_path)


def load_json_artifact(filename):
    """
    Load a JSON artifact from the models directory.

    Parameters
    ----------
    filename : str
        Name of the JSON file (e.g., 'metrics.json').

    Returns
    -------
    dict
        Parsed JSON content.
    """
    filepath = os.path.join(Config.MODEL_DIR, filename)
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Artifact not found at {filepath}. Run the training pipeline first.")
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)
