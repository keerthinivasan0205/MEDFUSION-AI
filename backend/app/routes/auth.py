# Authentication routes
import os
from flask import Blueprint, request, jsonify, current_app
from app.extensions import bcrypt
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from pymongo import MongoClient

auth_bp = Blueprint("auth", __name__)


def _get_mongo_db():
    mongo_uri = current_app.config.get("MONGO_URI")
    mongo_db_name = current_app.config.get("MONGO_DB")
    client = MongoClient(mongo_uri)
    return client[mongo_db_name]


# ================= REGISTER =================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "user")

    if not name or not email or not password:
        return jsonify({"message": "Missing required fields"}), 400

    db = _get_mongo_db()
    user_collection = db.users

    if user_collection.find_one({"email": email.lower()}):
        return jsonify({"message": "Email already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    user_doc = {
        "name": name,
        "email": email.lower(),
        "password": hashed_password,
        "role": role,
        "created_at": os.getenv("DATE", "")
    }

    user_collection.insert_one(user_doc)

    return jsonify({"message": "User registered successfully"}), 201


# ================= LOGIN =================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Missing email/password"}), 400

    db = _get_mongo_db()
    user_collection = db.users

    user = user_collection.find_one({"email": email.lower()})

    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(
        identity=str(user.get("_id")),
        additional_claims={"role": user.get("role", "user"), "email": user.get("email")}
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role", "user")
        }
    }), 200


# ================= PROTECTED ROUTE =================
@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    claims = get_jwt()

    return jsonify({
        "message": "Access granted",
        "user_id": user_id,
        "role": claims.get("role")
    }), 200


@auth_bp.route("/health", methods=["GET"])
def health_check():
    try:
        db = _get_mongo_db()
        db.command("ping")
        return jsonify({"status": "ok", "db": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "error", "db": "unreachable", "error": str(e)}), 500