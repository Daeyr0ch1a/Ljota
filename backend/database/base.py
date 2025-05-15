from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.database.config import DATABASE_URL
from backend.database.session import SessionLocal

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
