
# Ljota — Раннер по галактическим мирам

**2D-раннер**, в котором игрок управляет персонажем, бегущим по горизонтали. В игре есть **три уровня высоты**: низина, средина, небо. Игрок перемещается по платформам, избегая падений и сражаясь с мобами.

**Визуал:** JavaScript (PixiJS)
**Бэкенд:** Python (FastAPI)
**Игровая логика:** Lua-скрипты

---

## База данных

Используется **PostgreSQL** для хранения информации о пользователях и шаблонах героев.

### Таблицы:

- `users`: данные о пользователях
- `heroes`: шаблоны героев
- `better_Resilts`: рекорды пользователе
- `settings`: настройки игры

### Пример SQL-скрипта:

```sql

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(16) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    data_users JSONB DEFAULT '{}',
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS heroes (
    hero_id SERIAL PRIMARY KEY,
    name VARCHAR(64),
    role VARCHAR(32),
    ability JSONB,
    base_health INTEGER,
    speed INTEGER,
    gender VARCHAR(16)
);


CREATE TABLE IF NOT EXISTS better_results (
    result_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    level_reached INTEGER DEFAULT 1,
    date_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    sound_volume INTEGER DEFAULT 100 CHECK (sound_volume BETWEEN 0 AND 100),
    music_volume INTEGER DEFAULT 100 CHECK (music_volume BETWEEN 0 AND 100),
    control_scheme VARCHAR(32) DEFAULT 'default'
);

```

---

## Игровая механика

**Уровни**: персонаж может находиться в одном из трёх уровней (низ, середина, небо).
**Цель**: избегать падений, перепрыгивать препятствия, сражаться с мобами, проходить как можно дальше.

### Герои:

Герои отличаются ролями, способностями, базовым здоровьем и скоростью.

#### Пример героев:

```postgresql
INSERT INTO heroes (hero_id, name, role, ability, base_health, speed, gender)
VALUES 
(101, 'Jane Doe', 'medical', '{"type": "heal", "value": 10}', 100, 10, 'female'),
(102, 'John Smith', 'defender', '{"type": "shield", "duration": 5}', 120, 8, 'male'),
(103, 'Ljota Yoshimura', 'explorer', '{"type": "speed_boost", "duration": 3, "multiplier": 2.0}', 90, 12, 'female');

```

---

## Архитектура проекта

Используются **FastAPI** и **Lua** для логики, **PixiJS** — для визуализации.

```
📦 cosmic_runner
├── 📂 backend
│   ├── 📂 database
│   │   ├── db.py
│   │   ├── models.py
│   │   ├── seed.py
│   ├── 📂 game_logic
│   │   ├── runner.py
│   │   ├── mobs.py
│   │   ├── events.py
│   ├── api.py
│   ├── config.py
│   ├── requirements.txt
├── 📂 frontend
│   ├── 📂 public
│   │   ├── 📂 images
│   │   │   ├── placeholder.txt
│   │   ├── styles.css
│   ├── 📂 src
│   │   ├── game.js
│   │   ├── ui.js
│   │   ├── renderer.js
│   │   ├── api.js
│   ├── main.html
├── 📂 scripts
│   ├── save_manager.py
│   ├── ai_helpers.py
├── 📂 lua_scripts
│   ├── mob_behavior.lua
│   ├── events.lua
├── main.py
├── README.md 
```


**2D-раннер**, в котором игрок управляет персонажем, бегущим по горизонтали. В игре есть **три уровня высоты**: низина, средина, небо. Игрок перемещается по платформам, избегая падений и сражаясь с мобами.

**Визуал:** JavaScript (PixiJS)
**Бэкенд:** Python (FastAPI)
**Игровая логика:** Lua-скрипты

---

## База данных

Используется **PostgreSQL** для хранения информации о пользователях и шаблонах героев.

### Таблицы:

- `users`: данные о пользователях
- `heroes`: шаблоны героев
- `sessions` и другие — по мере расширения функционала

### Пример SQL-скрипта:

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(16) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    data_users JSONB DEFAULT '{}',
    password VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS heroes (
    hero_id INTEGER PRIMARY KEY,
    name VARCHAR(64),
    role VARCHAR(32),
    ability JSONB,
    base_health INTEGER,
    speed INTEGER,
    gender VARCHAR(16)
);
```

---

## Игровая механика

**Уровни**: персонаж может находиться в одном из трёх уровней (низ, середина, небо).
**Цель**: избегать падений, перепрыгивать препятствия, сражаться с мобами, проходить как можно дальше.

### Герои:

Герои отличаются ролями, способностями, базовым здоровьем и скоростью.

#### Пример героев:

```postgresql
INSERT INTO heroes (hero_id, name, role, ability, base_health, speed, gender)
VALUES 
(101, 'Jane Doe', 'medical', '{"type": "heal", "value": 10}', 100, 10, 'female'),
(102, 'John Smith', 'defender', '{"type": "shield", "duration": 5}', 120, 8, 'male'),
(103, 'Ljota Yoshimura', 'explorer', '{"type": "speed_boost", "duration": 3, "multiplier": 2.0}', 90, 12, 'female');

```

---

## Архитектура проекта

Используются **FastAPI** и **Lua** для логики, **PixiJS** — для визуализации.

```
📦 cosmic_runner
├── 📂 backend
│   ├── 📂 database
│   │   ├── db.py
│   │   ├── models.py
│   │   ├── seed.py
│   ├── 📂 game_logic
│   │   ├── runner.py
│   │   ├── mobs.py
│   │   ├── events.py
│   ├── api.py
│   ├── config.py
│   ├── requirements.txt
├── 📂 frontend
│   ├── 📂 public
│   │   ├── 📂 images
│   │   │   ├── placeholder.txt
│   │   ├── styles.css
│   ├── 📂 src
│   │   ├── game.js
│   │   ├── ui.js
│   │   ├── renderer.js
│   │   ├── api.js
│   ├── main.html
├── 📂 scripts
│   ├── save_manager.py
│   ├── ai_helpers.py
├── 📂 lua_scripts
│   ├── mob_behavior.lua
│   ├── events.lua
├── main.py
├── README.md 
```
