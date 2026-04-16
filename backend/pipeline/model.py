"""
model.py — CatBoost model definition and GridSearchCV configuration.
"""

from catboost import CatBoostClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import make_scorer, fbeta_score


def build_model():
    """
    Build a CatBoostClassifier instance.

    Returns
    -------
    CatBoostClassifier
        An unfitted CatBoost model configured with silent output.
    """
    model = CatBoostClassifier(
        verbose=0,
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
        'depth': [2, 4, 6, 8],
        'learning_rate': [0.01, 0.05, 0.1, 0.001],
        'iterations': [300, 500, 1000],
    }

    scorer = make_scorer(fbeta_score, beta=0.5)

    grid_search = GridSearchCV(
        estimator=model,
        param_grid=param_grid,
        scoring=scorer,
        n_jobs=8,
    )
    return grid_search
