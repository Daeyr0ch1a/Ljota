import os
import subprocess
import sys
import shutil

def run_command(command):
    """Запускает команду в новом процессе и проверяет успешность выполнения."""
    result = subprocess.run(command, shell=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        print(f"Ошибка: {result.stderr.strip()}")
        sys.exit(1)
    return result.stdout.strip()

# 1️⃣ Проверка наличия pyenv
print("Проверка pyenv...")
if shutil.which("pyenv") is None:
    print("Установка pyenv-win...")
    run_command("python -m pip install --upgrade pip")
    run_command("pip install pyenv-win")
    
    pyenv_path = os.path.expanduser("~\\.pyenv\\pyenv-win\\bin")
    os.environ["PATH"] += f";{pyenv_path}"
    
    run_command(f"{pyenv_path}\\pyenv.bat")

# 2️⃣ Установка Python 3.12.2
print("Установка Python 3.12.2 через pyenv...")
run_command("pyenv install -s 3.12.2")
run_command("pyenv local 3.12.2")

# 3️⃣ Получение пути к исполняемому файлу Python
python_path = run_command("pyenv which python")
if not python_path:
    print("Ошибка: не удалось найти исполняемый файл Python.")
    sys.exit(1)
print(f"Используем Python: {python_path}")

# 4️⃣ Создание виртуального окружения
venv_dir = "venv"
if not os.path.exists(venv_dir):
    print("Создание виртуального окружения...")
    run_command(f"{python_path} -m venv {venv_dir}")

# 5️⃣ Активация виртуального окружения и установка зависимостей
venv_python = os.path.join(venv_dir, "Scripts", "python.exe")
run_command(f"{venv_python} -m pip install --upgrade pip")
run_command(f"{venv_python} -m pip install -r backend/requirements.txt")

# 6️⃣ Запуск приложения
def run_command_realtime(command):
    """Запускает команду и выводит результат в реальном времени."""
    process = subprocess.Popen(command, shell=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    for line in process.stdout:
        print(line.strip())
    for line in process.stderr:
        print(f"Ошибка: {line.strip()}")
    process.wait()
    if process.returncode != 0:
        print(f"Ошибка: команда завершилась с кодом {process.returncode}")
        sys.exit(1)

# Запуск приложения
print("Запуск приложения...")
run_command_realtime(f"{venv_python} -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload")

print("\nПриложение запущено! Перейдите по ссылке: http://127.0.0.1:8000")
