import os
import warnings
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Load Environment Variables first, before anything else runs
load_dotenv()

# Suppress TensorFlow logging noise
warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Import Blueprints
from routes.customer import customer_bp
from routes.kitchen import kitchen_bp
from routes.admin import admin_bp
from routes.auth import auth_bp

# Initialize the Flask application
app = Flask(__name__)
CORS(app)

# Security configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
if not app.config["JWT_SECRET_KEY"]:
    raise ValueError("JWT_SECRET_KEY is not set in .env file")
jwt = JWTManager(app)

# Register all blueprints
app.register_blueprint(customer_bp)
app.register_blueprint(kitchen_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(auth_bp)

# Start the server
if __name__ == "__main__":
    print(" Cloud Kitchen Backend Starting...")
    print(f"Connecting to database at {os.getenv('DB_HOST', 'localhost')}...")
    app.run(debug=True)