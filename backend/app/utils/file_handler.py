import os
import uuid
from werkzeug.utils import secure_filename
from flask import abort

UPLOAD_FOLDER = os.path.join("uploads", "temp")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp", "gif", "webp", "tiff"}


def _allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def save_uploaded_file(file):
    if not file or not file.filename:
        abort(400, "No file selected")

    if not _allowed_file(file.filename):
        abort(400, f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}")

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    ext = file.filename.rsplit(".", 1)[1].lower()
    # Use UUID to avoid filename collisions and path traversal
    filename = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    file.save(file_path)
    return file_path


def save_file(file):
    return save_uploaded_file(file)
