# delivery_ai - Keras delivery time prediction model
import tensorflow as tf
import os
import warnings

warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

def load_delivery_ai():
    try:
        # 1. Find the exact folder where this Python file is located
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        
        # 2. Join that folder path with the model filename
        MODEL_PATH = os.path.join(BASE_DIR, "delivery_brain.keras")

        # 3. Load using the full path
        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"✅ Delivery AI Loaded successfully from: {MODEL_PATH}")
        return model
    except Exception as e:
        print(f"❌ Could not load Delivery AI: {e}")
        return None

delivery_ai = load_delivery_ai()