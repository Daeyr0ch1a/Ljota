from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from backend.api import api_router
import os

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],
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
    return FileResponse(html_path)

# Настройка статических файлов
app.mount("/static", StaticFiles(directory="frontend/"), name="static")