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
        
        # Try to find reports directory starting from current app root
        base_paths = [
            os.path.join(current_app.root_path, "..", "..", "reports"),  # For app instance
            os.path.join(os.getcwd(), "reports"),  # Current working directory
            "/app/reports",  # Render.com deployment path
            "/tmp/reports",  # Railways/temp storage
        ]
        
        file_path = None
        reports_dir = None
        
        for path in base_paths:
            abs_path = os.path.abspath(path)
            if os.path.exists(abs_path):
                potential_file = os.path.join(abs_path, filename)
                if os.path.exists(potential_file):
                    file_path = potential_file
                    reports_dir = abs_path
                    break
        
        if not file_path:
            print(f"Report not found: {filename}")
            print(f"Searched paths: {base_paths}")
            return jsonify({"error": "Report not found"}), 404
        
        # Final security check
        if not os.path.abspath(file_path).startswith(os.path.abspath(reports_dir)):
            return jsonify({"error": "Invalid file path"}), 400
        
        return send_file(
            file_path,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        print(f"Error downloading report: {e}")
        return jsonify({"error": str(e)}), 500