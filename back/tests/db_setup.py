import os
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
    print("URIIIIIIIII", TEST_SQLALCHEMY_DATABASE_URI)
    test_engine = create_engine(TEST_SQLALCHEMY_DATABASE_URI)
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    # Insert mock data
    with open('tests/data/mock_data.sql', 'r', encoding='utf-8') as f:
        sql_commands = f.read().split(';')
        with test_engine.begin() as connection:
            for command in sql_commands:
                command = command.strip()  # remove leading/trailing whitespace
                if command and not command.startswith('--'):  # ignore comments
                    try:
                        connection.execute(text(command))
                    except Exception as e:
                        #print(f"Failed to execute command: {command}. Error: {e}")
                        None

    return TestSessionLocal
