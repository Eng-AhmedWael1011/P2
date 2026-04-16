"""
data_summary.py — GET /data-summary endpoint.

Returns dataset insights including counts, distributions, and statistics.
"""

from flask import Blueprint, jsonify
from services.data_service import get_data_summary

data_summary_bp = Blueprint("data_summary", __name__)


@data_summary_bp.route("/data-summary", methods=["GET"])
def data_summary():
    """
    Return dataset summary information.

    Returns
    -------
    JSON
        Dictionary containing total_records, class distribution,
        numerical stats, and categorical distributions.
    """
    try:
        summary = get_data_summary()
        return jsonify(summary), 200
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to load data summary: {str(e)}"}), 500
