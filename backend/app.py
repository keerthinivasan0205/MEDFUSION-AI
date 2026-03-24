from flask import Flask
from config import Config
from app.extensions import db, jwt, bcrypt, cors

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
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Content-Type", "Authorization"],
    )

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(prediction_bp, url_prefix="/api/prediction")
    app.register_blueprint(history_bp, url_prefix="/api/history")
    app.register_blueprint(report_bp, url_prefix="/api/report")

    # JWT error handlers (JSON output)
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": getattr(error, 'description', 'Bad request')}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"error": getattr(error, 'description', 'Unauthorized')}), 401

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": getattr(error, 'description', 'Not found')}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": 'Internal server error'}), 500

    @jwt.unauthorized_loader
    def unauthorized_loader(callback):
        return jsonify({"error": "Missing Authorization Header"}), 401

    @jwt.invalid_token_loader
    def invalid_token_loader(callback):
        return jsonify({"error": "Invalid token"}), 422

    @jwt.expired_token_loader
    def expired_token_callback(header, payload):
        return jsonify({"error": "Token has expired"}), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(header, payload):
        return jsonify({"error": "Token has been revoked"}), 401

    return app


app = create_app()


# Create database tables
with app.app_context():
    from app.database import models
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)