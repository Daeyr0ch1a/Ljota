from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    connect_args={"client_encoding": "utf8"},
    echo=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
