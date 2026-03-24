from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.database.models import PredictionHistory

history_bp = Blueprint("history", __name__)


@history_bp.route("/", methods=["GET"])
@jwt_required()
def get_history():

    user_id = get_jwt_identity()

    records = PredictionHistory.query.filter_by(user_id=user_id)\
        .order_by(PredictionHistory.created_at.desc())\
        .all()

    history = []

    for r in records:
        history.append({
            "disease_type": r.disease_type,
            "prediction": r.predicted_class,
            "confidence": r.confidence,
            "risk_level": r.risk_level,
            "report_path": r.report_path,
            "date": r.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify(history), 200