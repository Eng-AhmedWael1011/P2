"""
preprocessing.py — Build the sklearn preprocessing pipeline.

Uses ColumnTransformer with MinMaxScaler for numerical features
and OneHotEncoder for categorical features.
"""

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder


# Column definitions
NUMERICAL_FEATURES = [
    "age",
    "education-num",
    "capital-gain",
    "capital-loss",
    "hours-per-week",
]

CATEGORICAL_FEATURES = [
    "workclass",
    "education_level",
    "marital-status",
    "occupation",
    "relationship",
    "race",
    "sex",
    "native-country",
]

TARGET_COLUMN = "income"


def get_feature_columns():
    """Return the lists of numerical and categorical feature names."""
    return NUMERICAL_FEATURES, CATEGORICAL_FEATURES


def build_preprocessor():
    """
    Build and return a ColumnTransformer preprocessing pipeline.

    Returns
    -------
    sklearn.compose.ColumnTransformer
        The preprocessing pipeline (unfitted).
    """
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", MinMaxScaler(), NUMERICAL_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )
    return preprocessor


def prepare_data(df):
    """
    Separate features and target, and remove duplicates.

    Parameters
    ----------
    df : pd.DataFrame
        Raw census DataFrame.

    Returns
    -------
    tuple
        (X, y) where X is the feature DataFrame and y is the target Series (0/1).
    """
    # Remove duplicates
    df = df.drop_duplicates().reset_index(drop=True)

    # Separate features and target
    X = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES].copy()
    y = (df[TARGET_COLUMN] == ">50K").astype(int)

    return X, y
