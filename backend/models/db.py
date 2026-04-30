import os
import mysql.connector
from mysql.connector import Error

def get_db_connection():
    """Reads secrets from .env and connects to MySQL."""
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME", "cloud_kitchen")
        )
        return connection
    except Error as err:
        print(f"❌ Database connection failed: {err}")
        return None