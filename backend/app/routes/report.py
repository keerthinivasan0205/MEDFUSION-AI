# Report generation routes
from flask import Blueprint, jsonify

report_bp = Blueprint("report", __name__, url_prefix="/report")

@report_bp.route("/health", methods=["GET"])
def report_health():
    return jsonify({
        "status": "Report route working successfully!"
    })