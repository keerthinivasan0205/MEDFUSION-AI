import os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = os.path.join("uploads", "temp")

def save_uploaded_file(file):
    """
    Saves uploaded file and returns file path
    """

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    file.save(file_path)

    return file_path


# ✅ Alias function (so old imports still work)
def save_file(file):
    return save_uploaded_file(file)