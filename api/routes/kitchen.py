from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from models.db import get_db_connection

kitchen_bp = Blueprint('kitchen', __name__)

@kitchen_bp.route("/api/kitchen/tickets", methods=["GET"])
@jwt_required()
def get_tickets():
    claims = get_jwt()
    if claims.get("role") not in ["kitchen", "admin"]:
        return jsonify({"msg": "Access forbidden: Staff only"}), 403

    db_conn = get_db_connection()
    if not db_conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = db_conn.cursor(dictionary=True)
        query = """
             SELECT *,
             (SELECT COUNT(*) +1 FROM orders o2 WHERE DATE(o2.created_at) = CURDATE() AND o2.id < orders.id) as daily_no
             FROM orders
             WHERE DATE(created_at) = CURDATE() AND status != 'delivered/served'
             ORDER BY id ASC
        """
        cursor.execute(query)
        tickets = cursor.fetchall()
        return jsonify(tickets)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if db_conn: db_conn.close()

@kitchen_bp.route("/api/kitchen/update_status/<int:order_id>", methods=["POST"])
@jwt_required()
def update_status(order_id):
    claims = get_jwt()
    if claims.get("role") not in ["kitchen", "admin"]:
        return jsonify({"msg": "Access forbidden: Staff only"}), 403

    data = request.get_json()
    new_status = data.get("status")

    db_conn = get_db_connection()
    try:
        cursor = db_conn.cursor()

        if new_status == 'ready':
            query = "UPDATE orders SET status = %s, finished_at = CURRENT_TIMESTAMP WHERE id = %s"
        else:
            query = "UPDATE orders SET status = %s WHERE id = %s"

        cursor.execute(query, (new_status, order_id))
        db_conn.commit()
        return jsonify({"status": "success", "message": f"Order updated to {new_status}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if db_conn: db_conn.close()
