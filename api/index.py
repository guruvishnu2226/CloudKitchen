import os
import sys
import warnings

# Add api folder to path so imports work correctly
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from routes.customer import customer_bp
from routes.kitchen import kitchen_bp
from routes.admin import admin_bp
from routes.auth import auth_bp

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
if not app.config["JWT_SECRET_KEY"]:
    raise ValueError("JWT_SECRET_KEY is not set in .env file")
jwt = JWTManager(app)

app.register_blueprint(customer_bp)
app.register_blueprint(kitchen_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(auth_bp)

if __name__ == "__main__":
    print("BiteCraft Backend Starting...")
    app.run(debug=False)