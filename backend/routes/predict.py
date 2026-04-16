"""
predict.py — POST /predict endpoint.

Accepts JSON user features and returns income prediction with probability.
"""

from flask import Blueprint, request, jsonify, current_app
from services.prediction_service import make_prediction

predict_bp = Blueprint("predict", __name__)


@predict_bp.route("/predict", methods=["POST"])
def predict():
    """
    Predict whether income exceeds 50K.

    Expects JSON body with feature values:
        age, workclass, education_level, education-num, marital-status,
        occupation, relationship, race, sex, capital-gain, capital-loss,
        hours-per-week, native-country

    Returns
    -------
    JSON
        {"prediction": ">50K" or "<=50K", "probability": float}
    """
    try:
        data = request.get_json()
        if data is None:
            return jsonify({"error": "Request body must be valid JSON"}), 400

        model = current_app.config["MODEL"]
        preprocessor = current_app.config["PREPROCESSOR"]

        result = make_prediction(model, preprocessor, data)
        return jsonify(result), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500
