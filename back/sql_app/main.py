from uvicorn import run
from api import app, init_db

def main():
    # Initialize the database
    init_db()

    # Run the application
    run("main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()