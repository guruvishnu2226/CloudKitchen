from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models.db import get_db_connection

admin_bp = Blueprint('admin', __name__)

@admin_bp.route("/api/admin/stats", methods=["GET"])
@jwt_required()
def get_stats():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"msg": "Access forbidden: Admins only"}), 403
    db_conn = get_db_connection()
    if not db_conn:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = db_conn.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) as total_orders FROM orders WHERE DATE(created_at) = CURDATE()")
        today_orders = cursor.fetchone()['total_orders']
        cursor.execute("SELECT COUNT(*) as pending FROM orders WHERE status = 'pending' AND DATE(created_at) = CURDATE()")
        pending = cursor.fetchone()['pending']
        cursor.execute("SELECT COUNT(*) as cooking FROM orders WHERE status = 'cooking' AND DATE(created_at) = CURDATE()")
        cooking = cursor.fetchone()['cooking']
        cursor.execute("SELECT COALESCE(SUM(total_price),0) as revenue FROM orders WHERE DATE(created_at) = CURDATE()")
        revenue = cursor.fetchone()['revenue']
        cursor.execute("SELECT COUNT(*) as total_items FROM menu")
        total_items = cursor.fetchone()['total_items']
        cursor.execute("""
            SELECT DATE_FORMAT(created_at,'%b') as month, COUNT(*) as count
            FROM orders GROUP BY MONTH(created_at), DATE_FORMAT(created_at,'%b')
            ORDER BY MONTH(created_at)
        """)
        monthly = cursor.fetchall()
        cursor.execute("""
            SELECT id, order_type, total_price, status, created_at
            FROM orders ORDER BY id DESC LIMIT 10
        """)
        recent_orders = cursor.fetchall()
        for o in recent_orders:
            if o.get('created_at'):
                o['created_at'] = o['created_at'].strftime('%Y-%m-%d %H:%M')
        return jsonify({
            "today_orders": today_orders,
            "pending": pending,
            "cooking": cooking,
            "revenue": float(revenue),
            "total_items": total_items,
            "monthly_orders": monthly,
            "recent_orders": recent_orders
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if db_conn: db_conn.close()

@admin_bp.route("/api/admin/menu", methods=["GET"])
@jwt_required()
def get_admin_menu():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"msg": "Access forbidden: Admins only"}), 403

    db_conn = get_db_connection()
    if not db_conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = db_conn.cursor(dictionary=True)
        cursor.execute("SELECT id, item_name, price, category FROM menu ORDER BY category")
        menu_items = cursor.fetchall()
        return jsonify(menu_items)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if db_conn: db_conn.close()

@admin_bp.route("/api/admin/menu/add", methods=["POST"])
@jwt_required()
def add_menu_item():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"msg": "Access forbidden: Admins only"}), 403

    data = request.get_json()
    if not data or 'item_name' not in data or 'price' not in data or 'category' not in data:
        return jsonify({"error": "Missing required fields"}), 400

    db_conn = get_db_connection()
    if not db_conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = db_conn.cursor()
        cursor.execute(
            "INSERT INTO menu (item_name, price, category) VALUES (%s, %s, %s)",
            (data['item_name'], float(data['price']), data['category'])
        )
        db_conn.commit()
        return jsonify({"status": "success", "message": f"Added {data['item_name']} to menu!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if db_conn: db_conn.close()

@admin_bp.route("/api/admin/menu/delete/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_menu_item(item_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"msg": "Access forbidden: Admins only"}), 403

    db_conn = get_db_connection()
    if not db_conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = db_conn.cursor()
        cursor.execute("DELETE FROM menu WHERE id = %s", (item_id,))
        db_conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Item not found"}), 404

        return jsonify({"status": "success", "message": "Item deleted."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if db_conn: db_conn.close()
