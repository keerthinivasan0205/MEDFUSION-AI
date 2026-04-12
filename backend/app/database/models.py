from app.extensions import db
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    role = db.Column(db.String(20), default="user")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class PredictionHistory(db.Model):
    __tablename__ = "prediction_history"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    disease_type = db.Column(db.String(50))
    predicted_class = db.Column(db.String(100))

    confidence = db.Column(db.Float)
    risk_level = db.Column(db.String(20))

    report_path = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="predictions")