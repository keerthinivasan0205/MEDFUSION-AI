from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.middleware.role_required import admin_required
from app.database.models import User, PredictionHistory
from app.extensions import db

admin_bp = Blueprint("admin", __name__)


# ================= GET ALL USERS =================
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required()
def get_users():

    users = User.query.all()

    result = []
    for user in users:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        })

    return jsonify(result), 200


# ================= GET ALL PREDICTIONS =================
@admin_bp.route("/predictions", methods=["GET"])
@jwt_required()
@admin_required()
def get_predictions():

    predictions = PredictionHistory.query.all()

    result = []
    for p in predictions:
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "disease": p.disease_type,
            "prediction": p.predicted_class,
            "confidence": p.confidence,
            "risk": p.risk_level
        })

    return jsonify(result), 200


# ================= DELETE USER =================
@admin_bp.route("/delete-user/<int:user_id>", methods=["DELETE"])
@jwt_required()
@admin_required()
def delete_user(user_id):

    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted"}), 200