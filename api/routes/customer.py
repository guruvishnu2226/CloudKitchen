from flask import Blueprint, request, jsonify
from datetime import datetime
import re
import os
import difflib
import logging
import json

from models.db import get_db_connection
from ml.delivery_model import delivery_ai
from ml.voice_model import voice_ai

# ── OpenRouter setup (once at startup) ──
try:
    from openai import OpenAI
    openrouter_client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY"),
    )
    print("✅ OpenRouter AI configured successfully")
except Exception as e:
    openrouter_client = None
    print(f"⚠️ OpenRouter not available: {e}")

# ── numpy (only if delivery_ai loaded) ──
try:
    import numpy as np
except ImportError:
    np = None

customer_bp = Blueprint('customer', __name__)

# CUSTOMER ROUTES

@customer_bp.route("/api/menu", methods=["GET"])
def showmenu():
    """Fetches the live menu from the database and displays it."""
    db_conn = get_db_connection()
    if not db_conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = db_conn.cursor(dictionary=True)
        cursor.execute("SELECT item_name, price, category, image_url FROM menu ORDER BY category")
        live_menu_items = cursor.fetchall()
        return jsonify(live_menu_items)
    except Exception as e:
        return jsonify({"error": str(e)}), 500 
    finally:
        if cursor: cursor.close()
        if db_conn: db_conn.close()
        
# Integrating llama        
@customer_bp.route("/api/ask_waiter", methods=["POST"])
def ask_waiter():
    data = request.get_json()
    user_query = data.get("user_message", "").strip()
    
    if not user_query:
        return jsonify({"error": "Please enter a Question."}), 400
    
    # Integrating LLM with Delivery Model
    ai_delivery_hint = ""
    match = re.search(r'(\d+(?:\.\d+)?)\s*km', user_query.lower())
    
    if match and delivery_ai:
        try:
            dist = float(match.group(1))
            prediction = delivery_ai.predict(np.array([[dist]]))
            total_mins = int(round(prediction[0][0]))
            ai_delivery_hint = f"CRITICAL: The delivery time is EXACTLY {total_mins} minutes. Do not estimate."  
        except Exception as e:
            logging.error(f"Keras prediction error in chat {e}")
                
    db_conn = get_db_connection()
    if not db_conn:
        return jsonify({"error": "Database connnection failed"}), 500

    organized_menu = "" 
    try:
        cursor = db_conn.cursor(dictionary=True)
        cursor.execute("SELECT item_name, price, category FROM menu")
        menu_items = cursor.fetchall()
        
        for item in menu_items:
            organized_menu += f"- {item['item_name']} (₹{item['price']}) | Category: {item['category']}\n"
    except Exception as e:
        return jsonify({"error": "Failed to fetch menu"}), 500
    finally:
        cursor.close()
        db_conn.close()
        
    try:            
        if not openrouter_client:
            return jsonify({"error": "AI assistant is offline"}), 500

        SYSTEM_PROMPT = (
            "You are a Kitchen Kiosk AI Waiter. Be brief. Use ONLY the data provided.\n\n"
            "### DATA\n"
            f"MENU:\n{organized_menu}\n"
            f"PREDICTION: {ai_delivery_hint if ai_delivery_hint else '15 mins (Takeaway)'}\n\n"
            "### RESPONSE FORMAT (STRICT)\n"
            "1. List items + prices.\n"
            "2. Total: (Item1 + Item2 = Sum).\n"
            "3. Time: Use the exact number from PREDICTION.\n"
            "4. DO NOT write paragraphs. NO yapping about policies."
        )

        response = openrouter_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_query}
            ]
        )

        return jsonify({"reply": response.choices[0].message.content})

    except Exception as e:
        logging.error(f"OpenRouter AI waiter error: {e}")
        print(f"OpenRouter error details: {e}")
        return jsonify({"error": f"AI assistant error: {str(e)}"}), 500

@customer_bp.route("/api/voice_order", methods=["POST"])
def process_voice():
    if not voice_ai:
        return jsonify({"error": "Voice processing model not loaded"}), 500
    if 'audio' not in request.files:
        return jsonify({"error":"No audio file received"}), 400
    
    audio_file = request.files['audio']
    temp_path = "temp_recording.wav"
    audio_file.save(temp_path)
    
    try:
        print("Listening the audio....")
        menu_cheat_sheet = "Garlic Naan, Butter Chicken, Arisi Paruppu Sadam, Kesari, Biryani, Dosa."
        result = voice_ai.transcribe(temp_path, initial_prompt=menu_cheat_sheet)
        spoken_text = result["text"].strip()
        print (f"The customer said: {spoken_text}")
        
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"transcription": spoken_text})
    
    except Exception as e:
        return jsonify({"error": f"Failed to transcribe:{str(e)}"}), 500
    
@customer_bp.route("/api/order", methods=["POST"])
def take_order():
    data = request.get_json()
    cart = data.get("cart", {})
    order_type = data.get("order_type", "takeaway")
    
    if not cart:
        return jsonify({"error": "Your cart is empty!"}), 400

    try:
        distance_km = float(data.get("distance"))
    except (ValueError, TypeError):
        distance_km = 0.0
        
    db_conn = get_db_connection()
    if not db_conn:
        return jsonify({"error": "Database connection failed"}), 500
        
    try:
        cursor = db_conn.cursor(dictionary=True)
        cursor.execute("SELECT item_name, price FROM menu")
        all_menu_items = cursor.fetchall()
        valid_food_names = [item['item_name'].lower() for item in all_menu_items]
        
        processed_items = []                                
        total_price = 0.0
        any_corrections = False
        
        for raw_food_name, quantity in cart.items():
            closest_matches = difflib.get_close_matches(raw_food_name.lower(), valid_food_names, n=1, cutoff=0.6)
            
            if closest_matches:
                matched_name_lower = closest_matches[0]
                ordered_item = next(item for item in all_menu_items if item['item_name'].lower() == matched_name_lower)
                
                if raw_food_name.lower() != ordered_item['item_name'].lower():
                    any_corrections = True
                    
                item_total = float(ordered_item['price']) * quantity
                total_price += item_total
                
                processed_items.append({
                    "item_name": ordered_item['item_name'],
                    "quantity": quantity,
                    "unit_price": ordered_item['price'],
                    "total_for_item": item_total
                })
            else:
                return jsonify({"error": f"Sorry, we don't have '{raw_food_name}' on the menu."}), 404
            
        # SAVE TO DATABASE FOR THE CHEF 
        
        insert_query ="""
              INSERT INTO orders (order_type, items, total_price,status)
              VALUES(%s,%s,%s, 'pending')
        """
        cursor.execute(insert_query,(order_type, json.dumps(processed_items), total_price))
        db_conn.commit()
        
        # Get the  ID and create the proffessional Tracking number 
        new_db_id = cursor.lastrowid
        date_prefix = datetime.now().strftime("%Y%m%d")
        tracking_id = f"#{date_prefix}-{new_db_id}"  
        
        # ........AI Message Logic......     
        ai_message = ""
        if order_type == "delivery":
            if distance_km <= 0:
                return jsonify({"error_title": "Invalid Distance!", "message":  "Error: Please enter a valid distance greater than 0 km."}), 400
            elif distance_km > 15:
                return jsonify({"error_title": "Out of Range!", "message": "Sorry! That is outside of our delivery zone. We only deliver within 15km."}), 400
            elif delivery_ai:
                prediction = delivery_ai.predict(np.array([[distance_km]])) 
                raw_minutes = prediction[0][0]
                
                total_minutes = int(round(raw_minutes))
                hours = total_minutes // 60
                minutes = total_minutes % 60
                
                if hours > 0:
                    time_text = f"{hours} hour{'s' if hours > 1 else ''} and {minutes} minute{'s' if minutes != 1 else ''}"
                else:
                    time_text = f"{minutes} minute{'s' if minutes != 1 else ''}"          
                
                ai_message = f"Based on traffic and your distance of {distance_km}km, delivery will take approximately <b>{time_text}</b>."
                
        elif order_type == "takeaway":
            ai_message = "Your order will be packed and ready for pickup within 15 mins!"
            
        elif order_type == "dine_in":
            ai_message = "Dine in: Please grab a table! The chef is preparing your meal."
                 
        return jsonify({
            "order_id": new_db_id,
            "tracking_id": tracking_id,
            "items": processed_items,
            "grand_total": total_price,
            "ai_message": ai_message,
            "correction_note": any_corrections
        })
            
    finally:
        cursor.close()
        db_conn.close()
        
# Status Checker
@customer_bp.route("/api/order/status/<int:order_id>", methods = ["GET"])
def check_status(order_id):
    """allows the customer to see if the chef has accepted or finished the  order"""
    db_conn = get_db_connection()
    try:
        cursor = db_conn.cursor(dictionary=True)
        cursor.execute("SELECT status, created_at, finished_at FROM orders WHERE id =%s",(order_id,))        
        order = cursor.fetchone()
        return jsonify(order) if order else (jsonify({"error": "Order not found"}), 404)
    finally:
        if cursor: cursor.close()
        if db_conn: db_conn.close()