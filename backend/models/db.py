import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# This loads your secrets from the .env file
load_dotenv() 

def get_db_connection():
    """Reads secrets from .env and connects to Aiven MySQL."""
    connection = None
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        return connection
    except Error as err:
        print(f"❌ Database connection failed: {err}")
        if connection and connection.is_connected():
            connection.close()
        return None

# This runs the test when you type 'python models/db.py'
if __name__ == "__main__":
    get_db_connection()