from flask import Flask
from flask_cors import CORS
from config import Config
from app.extensions import db, jwt, bcrypt

from app.routes.auth import auth_bp
from app.routes.prediction import prediction_bp
from app.routes.history import history_bp
from app.routes.report import report_bp
from app.routes.admin import admin_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(prediction_bp, url_prefix="/api/prediction")
    app.register_blueprint(history_bp, url_prefix="/api/history")
    app.register_blueprint(report_bp, url_prefix="/api/report")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    return app


app = create_app()

with app.app_context():
    try:
        from app.database import models
        db.create_all()
        print("✅ Database connected & tables created")
    except Exception as e:
        print("❌ Database connection failed:", e)


def preload_models():
    import threading
    def _load():
        try:
            from app.routes.prediction import get_skin_predictor, get_xray_predictor, get_fracture_predictor, get_auto_predictor
            print("⏳ Preloading ML models in background...")
            get_skin_predictor()
            print("✅ Skin model loaded")
            get_xray_predictor()
            print("✅ Xray model loaded")
            get_fracture_predictor()
            print("✅ Fracture model loaded")
            get_auto_predictor()
            print("✅ Auto model loaded")
            print("🚀 All models ready")
        except Exception as e:
            print("❌ Model preload failed:", e)

    t = threading.Thread(target=_load, daemon=True)
    t.start()


preload_models()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
