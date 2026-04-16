"""
data_service.py — Encapsulates data summary logic.
"""

from utils.helpers import load_json_artifact


def get_data_summary():
    """
    Load and return the pre-computed data summary.

    Returns
    -------
    dict
        Dataset summary statistics.
    """
    return load_json_artifact("data_summary.json")
