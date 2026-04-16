"""
feature_importance.py — GET /feature-importance endpoint.

Returns SHAP-based feature importance values.
"""

from flask import Blueprint, jsonify
from utils.helpers import load_json_artifact

feature_importance_bp = Blueprint("feature_importance", __name__)


@feature_importance_bp.route("/feature-importance", methods=["GET"])
def feature_importance():
    """
    Return feature importance values (SHAP-based).

    Returns
    -------
    JSON
        Dictionary of feature names mapped to importance values,
        sorted descending by importance.
    """
    try:
        importance = load_json_artifact("feature_importance.json")
        return jsonify(importance), 200
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to load feature importance: {str(e)}"}), 500
