from fastapi import APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from psycopg2 import IntegrityError
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database.base import get_db
from backend.database.models import User, BetterResult, ResultsHistory
from backend.auth.dependencies import get_current_user, SECRET_KEY, ALGORITHM, create_access_token
import bcrypt
from sqlalchemy.sql import func
from jose import JWTError, jwt
from datetime import datetime

api_router = APIRouter()

class ResponseMessage(BaseModel):
    success: bool
    message: str

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

class ResponseMessage(BaseModel):
    success: bool
    message: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    success: bool
    message: str

class ScorePayload(BaseModel):
    score: int
    level_reached: int

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

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

@api_router.post("/api/register", response_model=TokenResponse)
async def register(user: UserIn, db: Session = Depends(get_db)):
    from backend.database.models import User as DBUser
    print("Полученные данные:", user.dict())

    if "@" not in user.email:
        raise HTTPException(status_code=400, detail="Invalid email format")

    existing_user = db.query(DBUser).filter(DBUser.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.password)

    registration_date = datetime.utcnow().isoformat()
    data_users = {
        "gender": user.data_users.gender,
        "registration_date": registration_date,
        "birthDate": user.data_users.birthDate
    }

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

    # Генерируем токен после успешной регистрации
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "success": True,
        "message": "Registration successful"
    }

@api_router.get("/api/profile")  # Исправляем маршрут на /api/profile
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "name": current_user.name,
        "email": current_user.email,
        "data_users": current_user.data_users
    }

@api_router.get("/api/records")
async def get_records(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = (
        db.query(BetterResult, User.name)
        .join(User, BetterResult.user_id == User.id)
        .order_by(BetterResult.score.desc())
        .limit(10) 
        .all()
    )

    result = [
        {"place": idx + 1, "name": record[1] if record[1] else "Аноним", "score": record[0].score}
        for idx, record in enumerate(records)
    ]
    return result

@api_router.post("/api/save-score", response_model=ResponseMessage)
async def save_score(score_data: ScorePayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Извлекаем данные из запроса
    new_score = score_data.score
    new_level_reached = score_data.level_reached

    try:
        # Проверяем, есть ли уже запись для пользователя в better_results
        existing_record = db.query(BetterResult).filter(BetterResult.user_id == current_user.id).first()

        # Всегда сохраняем результат в results_history
        new_history_record = ResultsHistory(
            user_id=current_user.id,
            score=new_score
        )
        db.add(new_history_record)

        # Логика для better_results
        if existing_record:
            # Сравниваем: обновляем, если новый результат лучше
            # Сравниваем по score, а при равенстве — по level_reached
            if (new_score > existing_record.score) or (new_score == existing_record.score and new_level_reached > existing_record.level_reached):
                # Сохраняем старый рекорд в results_history
                old_history_record = ResultsHistory(
                    user_id=current_user.id,
                    score=existing_record.score
                )
                db.add(old_history_record)

                # Обновляем better_results
                existing_record.score = new_score
                existing_record.level_reached = new_level_reached
                existing_record.date_played = func.now()
        else:
            # Создаём новую запись в better_results
            new_record = BetterResult(
                user_id=current_user.id,
                score=new_score,
                level_reached=new_level_reached
            )
            db.add(new_record)

        # Обновляем места в better_results
        records = db.query(BetterResult).order_by(BetterResult.score.desc(), BetterResult.level_reached.desc()).all()
        for idx, record in enumerate(records):
            record.place = idx + 1

        db.commit()
        return {"success": True, "message": "Score saved successfully"}
    except Exception as e:
        db.rollback()
        print("Error saving score:", str(e))
        raise HTTPException(status_code=500, detail="Failed to save score")
    
@api_router.get("/api/records")
async def get_records(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        records = (
            db.query(BetterResult, User.name)
            .join(User, BetterResult.user_id == User.id)
            .order_by(BetterResult.score.desc(), BetterResult.level_reached.desc())
            .limit(10)
            .all()
        )

        result = [
            {"place": idx + 1, "name": record[1] if record[1] else "Аноним", "score": record[0].score}
            for idx, record in enumerate(records)
        ]

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch records: {str(e)}")