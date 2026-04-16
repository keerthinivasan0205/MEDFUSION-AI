# Report generation routes
from flask import Blueprint, jsonify, send_file, current_app
import os

report_bp = Blueprint("report", __name__, url_prefix="/report")

@report_bp.route("/health", methods=["GET"])
def report_health():
    return jsonify({
        "status": "Report route working successfully!"
    })
            

@report_bp.route("/<filename>", methods=["GET"])
def download_report(filename):
    """Serve PDF reports from the reports directory"""
    try:
        # Security: Only allow .pdf files and sanitize filename
        if not filename.endswith(".pdf"):
            return jsonify({"error": "Invalid file type"}), 400
        
        # Prevent directory traversal attacks
        if ".." in filename or "/" in filename or "\\" in filename:
            return jsonify({"error": "Invalid filename"}), 400
        
        reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "reports")
        file_path = os.path.join(reports_dir, filename)
        
        # Verify the file exists and is in the reports directory
        if not os.path.exists(file_path) or not os.path.abspath(file_path).startswith(os.path.abspath(reports_dir)):
            return jsonify({"error": "Report not found"}), 404
        
        return send_file(
            file_path,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        print(f"Error downloading report: {e}")
        return jsonify({"error": str(e)}), 500