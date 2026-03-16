# Authentication routes
from flask import Blueprint, request, jsonify
from app.extensions import db, bcrypt
from app.database.models import User
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)

auth_bp = Blueprint("auth", __name__)


# ================= REGISTER =================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "user")

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    new_user = User(
        name=name,
        email=email,
        password=hashed_password,
        role=role
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


# ================= LOGIN =================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    # ✅ FIXED HERE
    access_token = create_access_token(
        identity=str(user.id),  # MUST be string
        additional_claims={"role": user.role}  # store role separately
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token
    }), 200


# ================= PROTECTED ROUTE =================
@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    user_id = get_jwt_identity()  # string now
    claims = get_jwt()  # get extra claims

    return jsonify({
        "message": "Access granted",
        "user_id": user_id,
        "role": claims.get("role")
    }), 200