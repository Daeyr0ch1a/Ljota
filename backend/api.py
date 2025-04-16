# backend/api.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Создаем объект роутера
api_router = APIRouter()

# Пример базы данных пользователей
users_db = {"test@example.com": {"password": "secret"}}

class User(BaseModel):
    email: str
    password: str

# Маршрут для логина
@api_router.post("/api/login")
async def login(user: User):
    if user.email in users_db and users_db[user.email]["password"] == user.password:
        return {"success": True}
    raise HTTPException(status_code=400, detail="Invalid login or password")

# Маршрут для регистрации
@api_router.post("/api/register")
async def register(user: User):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    users_db[user.email] = {"password": user.password}
    return {"success": True}
