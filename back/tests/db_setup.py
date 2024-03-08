import os
import pgdumplib
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

def setup_function():
    # Load environment variables from your .env file
    load_dotenv('tests/.env')

    # Get the database credentials from environment variables
    username = os.getenv('TEST_DB_USERNAME')
    password = os.getenv('TEST_DB_PASSWORD')
    host = os.getenv('TEST_DB_HOST')
    port = os.getenv('TEST_DB_PORT')
    db_name = os.getenv('TEST_DB_NAME')

    TEST_SQLALCHEMY_DATABASE_URI = f"postgresql://{username}:{password}@{host}:5432/{db_name}"
    test_engine = create_engine(TEST_SQLALCHEMY_DATABASE_URI)
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    return TestSessionLocal
