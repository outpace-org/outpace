from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

username = os.getenv('OUTPACE_USER')
password = os.getenv('OUTPACE_PASSWORD')
host = os.getenv('OUTPACE_HOST')
port = os.getenv('OUTPACE_PORT')
DB_NAME = os.getenv('OUTPACE_DB')
print(username, password, host, port, DB_NAME)
SQLALCHEMY_DATABASE_URI = f"postgresql://{username}:{password}@{host}:{port}/{DB_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base: DeclarativeMeta = declarative_base()

