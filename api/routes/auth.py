from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token
from models.db import get_db_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    db_conn = get_db_connection()
    try:
        cursor = db_conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM staff WHERE username = %s", (username,))
        user = cursor.fetchone()

        if user and check_password_hash(user['password_hash'], password):
            access_token = create_access_token(
                identity=str(user['id']),
                additional_claims={"role": user['role']}
            )
            return jsonify({
                "token":    access_token,
                "role":     user['role'],
                "username": user['username']
            }), 200

        return jsonify({"message": "Invalid username or password"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if db_conn: db_conn.close()
