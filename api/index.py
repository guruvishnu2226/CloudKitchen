from flask import Flask
from .routes.customer import customer_bp
from .routes.kitchen import kitchen_bp
from .routes.admin import admin_bp
from .routes.auth import auth_bp

app = Flask(__name__)

# Register all your blueprints
app.register_blueprint(customer_bp, url_prefix='/api')
app.register_blueprint(kitchen_bp, url_prefix='/api/kitchen')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(auth_bp, url_prefix='/api/auth')

@app.route('/')
def home():
    return {"message": "BiteCraft API is running"}

# Critical for Vercel
app = app