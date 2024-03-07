import uvicorn
from sql_app.api import init_db


def main():
    init_db()
    uvicorn.run("sql_app.api:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
