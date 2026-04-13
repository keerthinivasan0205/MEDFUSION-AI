from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.predictors.skin_predictor import SkinPredictor
from app.predictors.xray_predictor import XrayPredictor
from app.predictors.fracture_predictor import FracturePredictor
from app.predictors.auto_predictor import AutoPredictor

from app.utils.file_handler import save_file
from app.utils.pdf_generator import generate_medical_report

from app.database.models import PredictionHistory
from app.extensions import db

prediction_bp = Blueprint("prediction", __name__)

# ================= LAZY LOAD MODELS =================
_skin_predictor = None
_xray_predictor = None
_fracture_predictor = None
_auto_predictor = None

def get_skin_predictor():
    global _skin_predictor
    if _skin_predictor is None:
        _skin_predictor = SkinPredictor()
    return _skin_predictor

def get_xray_predictor():
    global _xray_predictor
    if _xray_predictor is None:
        _xray_predictor = XrayPredictor()
    return _xray_predictor

def get_fracture_predictor():
    global _fracture_predictor
    if _fracture_predictor is None:
        _fracture_predictor = FracturePredictor()
    return _fracture_predictor

def get_auto_predictor():
    global _auto_predictor
    if _auto_predictor is None:
        _auto_predictor = AutoPredictor()
    return _auto_predictor


# =========================================================
# ---------------- SKIN PREDICTION ----------------
# =========================================================
@prediction_bp.route("/skin", methods=["POST"])
@jwt_required()
def predict_skin():

    user_id = get_jwt_identity()

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file_path = save_file(request.files["image"])

    predicted_class, confidence, probabilities = get_skin_predictor().predict(file_path)

    confidence_percent = round(confidence * 100, 2)

    if predicted_class in ["melanoma", "malignant_other"]:
        risk_level = "High"
        recommendation = "Malignant skin lesion detected. Consult a dermatologist."
    else:
        risk_level = "Low"
        recommendation = "Benign skin lesion detected."

    report_path = generate_medical_report(
        user_id, predicted_class, confidence_percent, risk_level, recommendation
    )

    db.session.add(PredictionHistory(
        user_id=user_id,
        disease_type="skin",
        predicted_class=predicted_class,
        confidence=confidence_percent,
        risk_level=risk_level,
        report_path=report_path
    ))
    db.session.commit()

    return jsonify({
        "type": "skin",
        "predicted_class": predicted_class,
        "confidence": confidence_percent,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "class_probabilities": probabilities,
        "report_path": report_path
    }), 200


# =========================================================
# ---------------- XRAY (PNEUMONIA) ----------------
# =========================================================
@prediction_bp.route("/xray", methods=["POST"])
@jwt_required()
def predict_xray():

    user_id = get_jwt_identity()

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file_path = save_file(request.files["image"])

    predicted_class, confidence, gradcam, segmented = get_xray_predictor().predict(file_path)

    confidence_percent = confidence

    if predicted_class == "pneumonia":
        risk_level = "High" if confidence_percent > 70 else "Medium"
        recommendation = "Signs of pneumonia detected. Consult a doctor."
    else:
        risk_level = "Low"
        recommendation = "No pneumonia detected."

    report_path = generate_medical_report(
        user_id, predicted_class, confidence_percent, risk_level, recommendation
    )

    db.session.add(PredictionHistory(
        user_id=user_id,
        disease_type="xray",
        predicted_class=predicted_class,
        confidence=confidence_percent,
        risk_level=risk_level,
        report_path=report_path
    ))
    db.session.commit()

    return jsonify({
        "type": "pneumonia",
        "predicted_class": predicted_class,
        "confidence": confidence_percent,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "gradcam_image": gradcam,
        "segmented_lungs": segmented,
        "report_path": report_path
    }), 200


# =========================================================
# ---------------- FRACTURE ----------------
# =========================================================
@prediction_bp.route("/fracture", methods=["POST"])
@jwt_required()
def predict_fracture():

    user_id = get_jwt_identity()

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file_path = save_file(request.files["image"])

    predicted_class, confidence = get_fracture_predictor().predict(file_path)

    confidence_percent = round(confidence * 100, 2)

    if predicted_class == "abnormal":
        risk_level = "High"
        recommendation = "Bone abnormality detected. Consult an orthopedic doctor."
    else:
        risk_level = "Low"
        recommendation = "No bone abnormality detected."

    report_path = generate_medical_report(
        user_id, predicted_class, confidence_percent, risk_level, recommendation
    )

    db.session.add(PredictionHistory(
        user_id=user_id,
        disease_type="fracture",
        predicted_class=predicted_class,
        confidence=confidence_percent,
        risk_level=risk_level,
        report_path=report_path
    ))
    db.session.commit()

    return jsonify({
        "type": "fracture",
        "predicted_class": predicted_class,
        "confidence": confidence_percent,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "report_path": report_path
    }), 200


# =========================================================
# ---------------- AUTO DETECTION ----------------
# =========================================================
@prediction_bp.route("/auto", methods=["POST"])
@jwt_required()
def predict_auto():

    user_id = get_jwt_identity()

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file_path = save_file(request.files["image"])

    detected_type, detect_conf = get_auto_predictor().predict(file_path)

    if detected_type == "skin":
        predicted_class, confidence, _ = get_skin_predictor().predict(file_path)
        disease_type = "skin"

    elif detected_type == "chest_xray":
        predicted_class, confidence, _, _ = get_xray_predictor().predict(file_path)
        disease_type = "pneumonia"

    elif detected_type == "bone_xray":
        predicted_class, confidence = get_fracture_predictor().predict(file_path)
        disease_type = "fracture"

    else:
        return jsonify({"error": "Unknown image type"}), 400

    confidence_percent = round(confidence * 100, 2)

    risk_level = "High" if confidence_percent > 70 else "Low"

    report_path = generate_medical_report(
        user_id, predicted_class, confidence_percent, risk_level, "Auto detected result"
    )

    db.session.add(PredictionHistory(
        user_id=user_id,
        disease_type=disease_type,
        predicted_class=predicted_class,
        confidence=confidence_percent,
        risk_level=risk_level,
        report_path=report_path
    ))
    db.session.commit()

    return jsonify({
        "detected_type": detected_type,
        "final_disease": disease_type,
        "predicted_class": predicted_class,
        "confidence": confidence_percent,
        "risk_level": risk_level,
        "report_path": report_path
    }), 200
