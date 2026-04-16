"""
model.py — CatBoost model definition and GridSearchCV configuration.
"""

from catboost import CatBoostClassifier
from sklearn.model_selection import GridSearchCV


def build_model():
    """
    Build a CatBoostClassifier instance.

    Returns
    -------
    CatBoostClassifier
        An unfitted CatBoost model configured with silent output.
    """
    model = CatBoostClassifier(
        random_seed=42,
        verbose=0,
        thread_count=-1,
    )
    return model


def build_grid_search(model=None):
    """
    Wrap a CatBoostClassifier in GridSearchCV for hyperparameter tuning.

    Parameters
    ----------
    model : CatBoostClassifier, optional
        The base model. If None, one is created automatically.

    Returns
    -------
    GridSearchCV
        A GridSearchCV object ready to be fitted.
    """
    if model is None:
        model = build_model()

    param_grid = {
        "iterations": [100, 300, 500],
        "depth": [2, 4, 6, 7],
        "learning_rate": [0.03, 0.05, 0.01, 0.001, 0.1],
    }

    grid_search = GridSearchCV(
        estimator=model,
        param_grid=param_grid,
        cv=5,
        scoring="f1",
        n_jobs=-1,
        verbose=1,
        refit=True,
    )
    return grid_search
