import os
import subprocess
#from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

def setup_function():
    # Load environment variables from your .env file
    #load_dotenv('tests/.env')

    # Get the database credentials from environment variables
    username = os.getenv('TEST_DB_USERNAME')
    password = os.getenv('TEST_DB_PASSWORD')
    host = os.getenv('TEST_DB_HOST')
    port = os.getenv('TEST_DB_PORT')
    db_name = os.getenv('TEST_DB_NAME')

    TEST_SQLALCHEMY_DATABASE_URI = f"postgresql://{username}:{password}@{host}:5432/{db_name}"
    test_engine = create_engine(TEST_SQLALCHEMY_DATABASE_URI)
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    # Set the PGPASSWORD environment variable
    env = os.environ.copy()
    env['PGPASSWORD'] = password

    # Restore the database
    command = f'pg_restore --verbose --clean --no-acl --no-owner -h {host} -U {username} -d {db_name} tests/data/outpace_dump_cust.sql'
    print("la commande", command)
    try:
        subprocess.run(command, shell=True, check=True, env=env)
    except subprocess.CalledProcessError as e:
        print(f"Command '{e.cmd}' returned non-zero exit status {e.returncode}.")
        print(f"Command output: {e.output}")
        return None

    return TestSessionLocal
