# delivery_ai - Keras delivery time prediction model
import tensorflow as tf
import os
import warnings

warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

def load_delivery_ai():
    try:
        # Grabbing your Keras model from the root directory
        model = tf.keras.models.load_model("delivery_brain.keras")
        print("✅ Delivery AI Loaded successfully")
        return model
    except Exception as e:
        print(f"Could not load Delivery AI: {e}")
        return None

delivery_ai = load_delivery_ai()