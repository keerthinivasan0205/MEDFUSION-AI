# Report generation routes
import os
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.pdf_generator import generate_medical_report
from app.database.models import PredictionHistory
from app.extensions import db

report_bp = Blueprint("report", __name__)


@report_bp.route("/health", methods=["GET"])
def report_health():
    return jsonify({"status": "Report route working successfully!"})


@report_bp.route("/generate", methods=["POST"])
@jwt_required()
def generate_report():
    user_id = get_jwt_identity()

    try:
        payload = request.get_json(silent=True) or {}
        prediction_id = payload.get("prediction_id")

        if prediction_id:
            prediction = PredictionHistory.query.filter_by(id=prediction_id, user_id=user_id).first()
        else:
            prediction = PredictionHistory.query.filter_by(user_id=user_id)\
                .order_by(PredictionHistory.created_at.desc()).first()

        if not prediction:
            return jsonify({"error": "No prediction history available for report generation."}), 404

        report_path = generate_medical_report(
            user_id,
            prediction.predicted_class,
            prediction.confidence,
            prediction.risk_level,
            "Please consult a medical professional for a full evaluation."
        )

        prediction.report_path = report_path
        db.session.commit()

        report_filename = os.path.basename(report_path)

        return jsonify({
            "message": "Report generated successfully.",
            "report_path": report_path,
            "report_filename": report_filename
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Report generation error: {str(e)}"}), 500


@report_bp.route('/download/<path:filename>', methods=['GET'])
@jwt_required()
def download_report(filename):
    from flask import send_from_directory

    # Prevent path traversal
    safe_name = os.path.basename(filename)

    # Use absolute path relative to the app root, not CWD
    reports_dir = os.path.abspath(
        os.path.join(os.path.dirname(current_app.root_path), 'reports')
    )
    report_file = os.path.join(reports_dir, safe_name)

    if not os.path.isfile(report_file):
        return jsonify({'error': 'Report not found'}), 404

    return send_from_directory(reports_dir, safe_name, as_attachment=True, mimetype='application/pdf')
