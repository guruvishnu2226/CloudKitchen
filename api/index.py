from flask import Flask
from .routes.customer import customer_bp
from .routes.kitchen import kitchen_bp
from .routes.admin import admin_bp
from .routes.auth import auth_bp

app = Flask(__name__)

# Change the prefix to '/' so it matches what Vercel sends
app.register_blueprint(customer_bp, url_prefix='/')
app.register_blueprint(kitchen_bp, url_prefix='/kitchen')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(auth_bp, url_prefix='/auth')

@app.route('/api/')
def home():
    return {"message": "BiteCraft API is running"}

# Critical for Vercel
app = app