import os
import subprocess
import sys


# Устанавливаем локальный `PYENV_ROOT`
PYENV_ROOT = os.path.join(os.getcwd(), r"backend\.pyenv-project")
PYENV_BIN = os.path.join(PYENV_ROOT, "pyenv-win", "bin", "pyenv.bat")

os.environ["PYENV"] = PYENV_ROOT
os.environ["PYENV_ROOT"] = PYENV_ROOT


def run_command(command):
    """Запускает команду и проверяет успешность выполнения."""
    result = subprocess.run(command, shell=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        print(f"Ошибка: {result.stderr.strip()}")
        sys.exit(1)
    return result.stdout.strip()

# 1️⃣ Установка версии Python
print("Установка Python 3.12.2 через локальный pyenv...")
run_command(f"{PYENV_BIN} install -s 3.12.2")
run_command(f"{PYENV_BIN} rehash")
run_command(f"{PYENV_BIN} local 3.12.2")

# 2️⃣ Получение пути к Python внутри `pyenv`
python_path = run_command(f"{PYENV_BIN} which python")
if not python_path:
    print("Ошибка: не удалось найти исполняемый файл Python.")
    sys.exit(1)
print(f"Используем Python: {python_path}")

# 3️⃣ Создание виртуального окружения
venv_dir = os.path.join(os.getcwd(), "venv")
if not os.path.exists(venv_dir):
    print("Создание виртуального окружения...")
    run_command(f"{python_path} -m venv {venv_dir}")

# 4️⃣ Активация виртуального окружения и установка зависимостей
venv_python = os.path.join(venv_dir, "Scripts", "python.exe")
run_command(f"{venv_python} -m pip install --upgrade pip")
run_command(f"{venv_python} -m pip install -r backend/requirements.txt")

# 5️⃣ Запуск приложения
print("Запуск приложения...")
run_command(f"{venv_python} -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload")

print("\nПриложение запущено! Перейдите по ссылке: http://127.0.0.1:8000")