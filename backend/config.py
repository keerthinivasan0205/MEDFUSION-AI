import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-jwt-secret-in-production")

    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') or \
        f"sqlite:///{os.path.join(os.path.dirname(__file__), 'app.db')}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
    MONGO_DB = os.getenv('MONGO_DB', 'medfusion')