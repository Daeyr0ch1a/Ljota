from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from backend.api import api_router
import os

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутер
app.include_router(api_router)

# Настройка для main.html
@app.get("/")
async def get_index():
    html_path = os.path.join("frontend", "main.html")
    if not os.path.exists(html_path):
        raise HTTPException(status_code=404, detail="Main page not found")
    return FileResponse(html_path)

# Маршрут /games
@app.get("/games")
async def get_game():
    html_path = os.path.join("frontend", "game.html")
    if not os.path.exists(html_path):
        raise HTTPException(status_code=404, detail="Game page not found")
    return FileResponse(html_path)

# Добавляем маршрут /game для обратной совместимости
@app.get("/game")
async def get_game_alias():
    html_path = os.path.join("frontend", "game.html")
    if not os.path.exists(html_path):
        raise HTTPException(status_code=404, detail="Game page not found")
    return FileResponse(html_path)

# Настройка статических файлов
app.mount("/static", StaticFiles(directory="frontend/"), name="static")