"""
metrics.py — GET /metrics endpoint.

Returns all evaluation metrics (accuracy, precision, recall, F1, F-beta, confusion matrix).
"""

from flask import Blueprint, jsonify
from utils.helpers import load_json_artifact

metrics_bp = Blueprint("metrics", __name__)


@metrics_bp.route("/metrics", methods=["GET"])
def get_metrics():
    """
    Return all evaluation metrics.

    Returns
    -------
    JSON
        Dictionary containing accuracy, precision, recall, f1_score,
        fbeta_score, and confusion_matrix.
    """
    try:
        metrics = load_json_artifact("metrics.json")
        return jsonify(metrics), 200
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to load metrics: {str(e)}"}), 500
