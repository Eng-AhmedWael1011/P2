"""
data_loader.py — Load the Census Finding Donors dataset.
"""

import os
import pandas as pd


def load_data(data_path=None):
    """
    Load the census dataset from a CSV file.

    Parameters
    ----------
    data_path : str, optional
        Absolute or relative path to the CSV file.
        Defaults to ``../data/census.csv`` relative to the backend directory.

    Returns
    -------
    pd.DataFrame
        Raw census data.
    """
    if data_path is None:
        # Default: relative to this file → backend/pipeline/ → backend/ → project root
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        data_path = os.path.join(base_dir, "data", "census.csv")

    df = pd.read_csv(data_path)

    # Strip leading/trailing whitespace from string columns
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].str.strip()

    return df
