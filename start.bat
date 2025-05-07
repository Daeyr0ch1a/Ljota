@echo off

REM 1️⃣ Создаём виртуальное окружение, если его нет
if not exist "venv" (
    echo 🔹 Создаём виртуальное окружение...
    py -m venv venv
)

REM 2️⃣ Активируем виртуальное окружение
echo 🔹 Активируем виртуальное окружение...
call venv\Scripts\activate

REM 3️⃣ Устанавливаем зависимости
echo 🔹 Устанавливаем зависимости...
pip install --upgrade pip
pip install -r backend\requirements.txt

REM 4️⃣ Запускаем FastAPI-приложение
echo 🚀 Запускаем FastAPI-приложение...
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
