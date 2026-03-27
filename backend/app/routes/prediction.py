import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.predictors.skin_predictor import SkinPredictor
from app.predictors.xray_predictor import XrayPredictor
from app.predictors.fracture_predictor import FracturePredictor

from app.utils.file_handler import save_file
from app.utils.pdf_generator import generate_medical_report

from app.database.models import PredictionHistory
from app.extensions import db

prediction_bp = Blueprint("prediction", __name__)

# Load models once at startup
skin_predictor = SkinPredictor()
xray_predictor = XrayPredictor()
fracture_predictor = FracturePredictor()


def _cleanup(file_path):
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
    except OSError:
        pass


# ---------------- SKIN PREDICTION ----------------
@prediction_bp.route("/skin", methods=["POST"])
@jwt_required()
def predict_skin():
    user_id = get_jwt_identity()

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    file_path = save_file(image_file)

    try:
        predicted_class, confidence, probabilities = skin_predictor.predict(file_path)
    finally:
        _cleanup(file_path)

    confidence_percent = round(confidence * 100, 2)

    if predicted_class in ["melanoma", "malignant_other"]:
        risk_level = "High"
        recommendation = "Malignant skin lesion detected. Please consult a dermatologist."
    else:
        risk_level = "Low"
        recommendation = "Benign skin lesion detected."

    report_path = generate_medical_report(
        user_id, predicted_class, confidence_percent, risk_level, recommendation
    )

    prediction_record = PredictionHistory(
        user_id=user_id,
        disease_type="skin",
        predicted_class=predicted_class,
        confidence=confidence_percent,
        risk_level=risk_level,
        report_path=report_path
    )
    db.session.add(prediction_record)
    db.session.commit()

    return jsonify({
        "user_id": user_id,
        "predicted_class": predicted_class,
        "confidence": confidence_percent,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "class_probabilities": probabilities,
        "report_path": report_path
    }), 200


# ---------------- XRAY PREDICTION (PNEUMONIA) ----------------
@prediction_bp.route("/xray", methods=["POST"])
@jwt_required()
def predict_xray():
    user_id = get_jwt_identity()

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    file_path = save_file(image_file)

    try:
        predicted_class, confidence, gradcam_image, segmented_image = xray_predictor.predict(file_path)
    finally:
        _cleanup(file_path)

    # Fix: confidence is already rounded in XrayPredictor; ensure it's a float
    confidence_percent = round(float(confidence), 2)

    if predicted_class == "pneumonia":
        risk_level = "High" if confidence_percent > 70 else "Medium"
        recommendation = "Signs of pneumonia detected. Please consult a doctor."
    else:
        risk_level = "Low"
        recommendation = "No pneumonia detected."

    report_path = generate_medical_report(
        user_id, predicted_class, confidence_percent, risk_level, recommendation
    )

    prediction_record = PredictionHistory(
        user_id=user_id,
        disease_type="xray",
        predicted_class=predicted_class,
        confidence=confidence_percent,
        risk_level=risk_level,
        report_path=report_path
    )
    db.session.add(prediction_record)
    db.session.commit()

    return jsonify({
        "user_id": user_id,
        "predicted_class": predicted_class,
        "confidence": confidence_percent,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "report_path": report_path,
        "gradcam_image": gradcam_image,
        "segmented_lungs": segmented_image
    }), 200


# ---------------- FRACTURE PREDICTION ----------------
@prediction_bp.route("/fracture", methods=["POST"])
@jwt_required()
def predict_fracture():
    user_id = get_jwt_identity()

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    file_path = save_file(image_file)

    try:
        predicted_class, confidence = fracture_predictor.predict(file_path)
    finally:
        _cleanup(file_path)

    confidence_percent = round(confidence * 100, 2)

    if predicted_class == "abnormal":
        risk_level = "High"
        recommendation = "Bone abnormality detected. Please consult an orthopedic doctor."
    else:
        risk_level = "Low"
        recommendation = "No bone abnormality detected."

    report_path = generate_medical_report(
        user_id, predicted_class, confidence_percent, risk_level, recommendation
    )

    prediction_record = PredictionHistory(
        user_id=user_id,
        disease_type="fracture",
        predicted_class=predicted_class,
        confidence=confidence_percent,
        risk_level=risk_level,
        report_path=report_path
    )
    db.session.add(prediction_record)
    db.session.commit()

    return jsonify({
        "user_id": user_id,
        "predicted_class": predicted_class,
        "confidence": confidence_percent,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "report_path": report_path
    }), 200
