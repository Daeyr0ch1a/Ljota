from fastapi import APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from psycopg2 import IntegrityError
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database.base import get_db
from backend.database.models import User
from backend.auth.dependencies import get_current_user, SECRET_KEY, ALGORITHM, create_access_token
import bcrypt
from jose import JWTError, jwt
from datetime import datetime



# Создаем объект роутера
api_router = APIRouter()

# Модели для входных данных
class UserData(BaseModel):
    gender: str
    birthDate: str  

class UserLogin(BaseModel):
    email: str
    password: str


class UserIn(BaseModel):
    name: str
    email: str
    password: str
    data_users: UserData

# Модель для ответа
class ResponseMessage(BaseModel):
    success: bool
    message: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    success: bool
    message: str


# Функция для хэширования пароля
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Функция для проверки пароля
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Маршрут для логина
@api_router.post("/api/login", response_model=TokenResponse)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    from backend.database.models import User as DBUser
    db_user = db.query(DBUser).filter(DBUser.email == user.email).first()
    if db_user and verify_password(user.password, db_user.password):
        access_token = create_access_token(data={"sub": db_user.email})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "success": True,
            "message": "Авторизация успешна"
        }
    raise HTTPException(status_code=400, detail="Invalid login or password")

# Маршрут для регистрации
@api_router.post("/api/register", response_model=ResponseMessage)
async def register(user: UserIn, db: Session = Depends(get_db)):
    from backend.database.models import User as DBUser
    print("Полученные данные:", user.dict())

    # Валидация email
    if "@" not in user.email:
        raise HTTPException(status_code=400, detail="Invalid email format")

    # Проверка существующего пользователя
    existing_user = db.query(DBUser).filter(DBUser.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Хэшируем пароль
    hashed_password = hash_password(user.password)

    # Формируем data_users
    registration_date = datetime.utcnow().isoformat()
    data_users = {
        "gender": user.data_users.gender,
        "registration_date": registration_date,
        "birthDate": user.data_users.birthDate
    }

    # Создаем нового пользователя
    new_user = DBUser(
        name=user.name,
        email=user.email,
        password=hashed_password,
        data_users=data_users
    )


    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError as e:
        db.rollback()
        print("IntegrityError:", str(e))
        raise HTTPException(status_code=400, detail="Registration failed: possibly duplicate email")

    return {"success": True, "message": "Registration successful"}

@api_router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user
