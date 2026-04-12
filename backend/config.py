import os

class Config:

    # Get database URL from environment (Render)
    db_url = os.getenv("DATABASE_URL")

    if db_url:
        # Fix postgres prefix issue (Render uses postgres://)
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)

        SQLALCHEMY_DATABASE_URI = db_url

    else:
        # ✅ Local MySQL (for VS Code)
        SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:Keerthi0205@localhost/ai_disease_db"

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Security keys
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key")