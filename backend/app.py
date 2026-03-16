from flask import Flask
from config import Config
from app.extensions import db, jwt, bcrypt

# Blueprints
from app.routes.auth import auth_bp
from app.routes.prediction import prediction_bp
from app.routes.history import history_bp
from app.routes.report import report_bp


def create_app():
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(prediction_bp, url_prefix="/api/prediction")
    app.register_blueprint(history_bp, url_prefix="/api/history")
    app.register_blueprint(report_bp, url_prefix="/api/report")

    return app


app = create_app()


# Create database tables
with app.app_context():
    from app.database import models
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True)