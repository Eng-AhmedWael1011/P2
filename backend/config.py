"""
config.py — Application configuration.

Loads environment variables and defines paths for model artifacts and data.
"""

import os
from dotenv import load_dotenv

# Load .env file from the backend directory
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))


class Config:
    """Flask application configuration."""

    # Flask settings
    FLASK_ENV = os.environ.get("FLASK_ENV", "production")
    DEBUG = os.environ.get("FLASK_DEBUG", "0") == "1"

    # Paths (all relative to the backend directory)
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_DIR = os.path.join(BASE_DIR, os.environ.get("MODEL_PATH", "models"))
    DATA_DIR = os.path.join(BASE_DIR, os.environ.get("DATA_PATH", "../data"))

    # CORS
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")
