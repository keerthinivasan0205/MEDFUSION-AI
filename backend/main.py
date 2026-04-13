from flask import Flask
from flask_cors import CORS
from config import Config
from app.extensions import db, jwt, bcrypt

# Blueprints
from app.routes.auth import auth_bp
from app.routes.prediction import prediction_bp
from app.routes.history import history_bp
from app.routes.report import report_bp
from app.routes.admin import admin_bp


def create_app():
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # Allow all origins (change later for production security)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(prediction_bp, url_prefix="/api/prediction")
    app.register_blueprint(history_bp, url_prefix="/api/history")
    app.register_blueprint(report_bp, url_prefix="/api/report")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    return app


# Create app instance
app = create_app()


# Create database tables (only if DB is connected)
with app.app_context():
    try:
        from app.database import models
        db.create_all()
        print("✅ Database connected & tables created")
    except Exception as e:
        print("❌ Database connection failed:", e)


# Local development only
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)