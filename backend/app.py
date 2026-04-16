"""
app.py — Flask application entry point.

Creates the Flask app, enables CORS, registers route blueprints,
and loads the model/preprocessor once at startup.
"""

import os
import sys

# Ensure the backend directory is on the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_cors import CORS
from config import Config
from utils.helpers import load_model, load_preprocessor, load_feature_names
from routes.predict import predict_bp
from routes.metrics import metrics_bp
from routes.data_summary import data_summary_bp
from routes.feature_importance import feature_importance_bp


def create_app():
    """
    Application factory function.

    Creates and configures the Flask application:
    - Enables CORS
    - Loads model artifacts at startup
    - Registers API route blueprints

    Returns
    -------
    Flask
        Configured Flask application instance.
    """
    flask_app = Flask(__name__)
    flask_app.config.from_object(Config)

    # Enable CORS for frontend communication
    CORS(flask_app, resources={r"/*": {"origins": Config.CORS_ORIGINS}})

    # Load model artifacts once at startup
    try:
        flask_app.config["MODEL"] = load_model()
        flask_app.config["PREPROCESSOR"] = load_preprocessor()
        flask_app.config["FEATURE_NAMES"] = load_feature_names()
        print("[APP] Model artifacts loaded successfully.")
    except FileNotFoundError as e:
        print(f"[APP] WARNING: {e}")
        print("[APP] The API will not work until the model is trained.")
        flask_app.config["MODEL"] = None
        flask_app.config["PREPROCESSOR"] = None
        flask_app.config["FEATURE_NAMES"] = None

    # Register blueprints
    flask_app.register_blueprint(predict_bp)
    flask_app.register_blueprint(metrics_bp)
    flask_app.register_blueprint(data_summary_bp)
    flask_app.register_blueprint(feature_importance_bp)

    # Health check endpoint
    @flask_app.route("/", methods=["GET"])
    def health_check():
        return {"status": "ok", "message": "Finding Donors API is running."}, 200

    return flask_app


# Create the app instance (used by gunicorn: app:app)
app = create_app()


if __name__ == "__main__":
    # Development mode only
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=Config.DEBUG,
    )
