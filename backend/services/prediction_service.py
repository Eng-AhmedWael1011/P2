"""
prediction_service.py — Encapsulates prediction logic.
"""

import pandas as pd
import numpy as np
from pipeline.preprocessing import NUMERICAL_FEATURES, CATEGORICAL_FEATURES


def make_prediction(model, preprocessor, input_data):
    """
    Make a prediction for a single input.

    Parameters
    ----------
    model : estimator
        Trained model.
    preprocessor : ColumnTransformer
        Fitted preprocessor.
    input_data : dict
        Dictionary of feature values.

    Returns
    -------
    dict
        Prediction result with label and probability.
    """
    # Create DataFrame from input
    df = pd.DataFrame([input_data])

    # Ensure correct column order
    expected_cols = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
    for col in expected_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required feature: {col}")

    df = df[expected_cols]

    # Strip whitespace from string columns
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].str.strip()

    # Preprocess
    X_processed = preprocessor.transform(df)

    # Predict
    prediction = model.predict(X_processed)[0]
    probabilities = model.predict_proba(X_processed)[0]

    # CatBoost returns probabilities for each class
    prob_positive = float(probabilities[1])

    return {
        "prediction": ">50K" if prediction == 1 else "<=50K",
        "probability": round(prob_positive, 4),
    }
