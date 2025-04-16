from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from backend.api import api_router
import os

app = FastAPI()

# Подключаем роутер
app.include_router(api_router)

# Настроим путь к main.html с помощью os.path
@app.get("/")
async def get_index():
    html_path = os.path.join("frontend", "main.html")
    # Возвращаем файл main.html
    return FileResponse(html_path)

# Дополнительно: настройка для статических файлов
app.mount("/static", StaticFiles(directory="frontend/"), name="static")
