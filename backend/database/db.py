from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


DB_USERNAME = "postgres"
DB_PASSWORD = "5852"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "Ljota"


DATABASE_URL = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Создаем движок подключения
engine = create_engine(
    DATABASE_URL,
    connect_args={"client_encoding": "utf8"},
    echo=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
