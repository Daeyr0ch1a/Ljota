import { getProfile } from './api.js';
import { getCurrentSpriteIndex } from './state.js';

let app, characterContainer, obstacles = [], currentSegment, score, gameSpeed, localSpriteIndex = 0;
let characterFrames = {};
let isTexturesLoaded = false;
let isInitializing = false;
let isContextLost = false; // Флаг для отслеживания потери контекста

// Функции для добавления и удаления слушателей событий
function addEventListeners() {
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', handleResize);
}

function removeEventListeners() {
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('resize', handleResize);
}

function handleKeydown(event) {
    if ((event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') && currentSegment > 0) {
        currentSegment--;
        moveCharacterToSegment(currentSegment);
    } else if ((event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') && currentSegment < 2) {
        currentSegment++;
        moveCharacterToSegment(currentSegment);
    }
}

function handleResize() {
    if (app) {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        if (characterContainer) {
            characterContainer.x = window.innerWidth * 0.2;
            moveCharacterToSegment(currentSegment);
        }
    }
}

function initializeGame() {
    if (isInitializing || app) {
        console.log('Инициализация уже выполняется или app существует, пропускаем');
        return;
    }
    isInitializing = true;

    const gameField = document.getElementById('gameField');
    const segments = document.querySelectorAll('.segment');
    const scoreDisplay = document.getElementById('scoreDisplay');

    if (!gameField || !segments.length || !scoreDisplay) {
        console.error('Required game elements not found');
        isInitializing = false;
        return;
    }

    currentSegment = 1;
    score = 0;
    gameSpeed = 5;
    localSpriteIndex = parseInt(localStorage.getItem('currentSpriteIndex')) || getCurrentSpriteIndex();
    console.log(`Инициализация игры с localSpriteIndex: ${localSpriteIndex}`);

    const canvas = document.createElement('canvas');
    canvas.id = 'characterCanvas';
    document.body.appendChild(canvas);

    characterContainer = new PIXI.Container();
    characterContainer.width = 100;
    characterContainer.height = 100;
    characterContainer.x = window.innerWidth * 0.2;

    try {
        app = new PIXI.Application({
            view: canvas,
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundAlpha: 0,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });
        console.log('PIXI.Application успешно создан');
    } catch (error) {
        console.error('Ошибка создания PIXI.Application:', error);
        isInitializing = false;
        return;
    }

    canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        console.warn('WebGL context lost in game');
        isContextLost = true;
        if (app && app.ticker) {
            app.ticker.stop();
        }
        if (app && app.stage) {
            app.stage.removeChildren();
        }
    });

    canvas.addEventListener('webglcontextrestored', () => {
        if (isContextLost) {
            console.log('WebGL context restored in game');
            isContextLost = false;
            setTimeout(() => {
                restartGame();
            }, 100); // Задержка перед перезапуском
        }
    });

    const characterTextures = {
        0: '/static/public/assets/characters/biker/Biker_run.png',
        1: '/static/public/assets/characters/cyborg/Cyborg_run.png',
        2: '/static/public/assets/characters/punk/Punk_run.png'
    };

    PIXI.Assets.load(Object.values(characterTextures)).then((textures) => {
        console.log('Все текстуры для игры загружены:', textures);
        Object.keys(characterTextures).forEach(index => {
            const texture = textures[characterTextures[index]];
            if (!texture) {
                console.error(`Текстура для персонажа с индексом ${index} не загружена: ${characterTextures[index]}`);
                return;
            }

            const frameWidth = texture.width / 6;
            const frameHeight = texture.height;

            const frames = [];
            for (let i = 0; i < 6; i++) {
                const frame = new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight);
                const frameTexture = new PIXI.Texture(texture.baseTexture, frame);
                frames.push(frameTexture);
            }
            characterFrames[index] = frames;
            console.log(`Текстуры для персонажа ${index} предзагружены: frameWidth=${frameWidth}, frameHeight=${frameHeight}`);
        });

        if (Object.keys(characterFrames).length === 0) {
            console.error('Ни одна текстура не была предзагружена!');
            isInitializing = false;
            return;
        }

        isTexturesLoaded = true;
        loadCharacter();
        app.stage.addChild(characterContainer);
        moveCharacterToSegment(currentSegment);
        isInitializing = false;
    }).catch(err => {
        console.error('Ошибка предзагрузки текстур:', err);
        isInitializing = false;
    });

    function loadCharacter() {
        console.log(`Загрузка персонажа с localSpriteIndex: ${localSpriteIndex}`);
        const frames = characterFrames[localSpriteIndex];
        if (!frames) {
            console.error(`Кадры для персонажа с индексом ${localSpriteIndex} не найдены`);
            return;
        }

        if (characterContainer.children.length > 0) {
            characterContainer.removeChildren();
        }

        const characterSprite = new PIXI.AnimatedSprite(frames);
        characterSprite.animationSpeed = 0.2;
        characterSprite.play();
        characterSprite.anchor.set(0.5);

        const frameHeight = frames[0].height;
        const targetHeight = 80;
        const scaleFactor = targetHeight / frameHeight;
        characterSprite.scale.set(scaleFactor);
        console.log(`Масштаб персонажа: scaleFactor=${scaleFactor}, итоговая высота=${frameHeight * scaleFactor}, итоговая ширина=${frames[0].width * scaleFactor}`);

        characterContainer.addChild(characterSprite);
        characterSprite.x = characterContainer.width / 2;
        characterSprite.y = characterContainer.height / 2;
        console.log(`Персонаж с индексом ${localSpriteIndex} успешно загружен`);
    }

    app.ticker.add(() => {
        if (Math.random() < 0.02) {
            const obstacleSegment = Math.floor(Math.random() * 3);
            const obstacle = new PIXI.Graphics();
            obstacle.beginFill(0xff0000);
            obstacle.drawCircle(0, 0, 15);
            obstacle.endFill();
            obstacle.pivot.set(15, 15);

            const segment = segments[obstacleSegment];
            const rect = segment.getBoundingClientRect();
            obstacle.x = window.innerWidth + 50;
            obstacle.y = rect.top + rect.height / 2;
            obstacles.push({ sprite: obstacle, segment: obstacleSegment });
            app.stage.addChild(obstacle);
        }

        obstacles.forEach((obstacle, index) => {
            obstacle.sprite.x -= gameSpeed;
            if (
                Math.abs(obstacle.sprite.x - characterContainer.x) < 50 &&
                obstacle.segment === currentSegment
            ) {
                app.ticker.stop();
                showGameOverModal(score);
                saveScore(score).then(() => {
                    console.log('Score saved successfully (single call)');
                });
            }
            if (obstacle.sprite.x < -50) {
                app.stage.removeChild(obstacle.sprite);
                obstacles.splice(index, 1);
            }
        });

        score += 1;
        scoreDisplay.textContent = `Score: ${score}`;
        gameSpeed += 0.005;
    });

    addEventListeners();
}

function showGameOverModal(finalScore) {
    const modal = document.getElementById('gameOverModal');
    const finalScoreDisplay = document.getElementById('finalScore');
    if (!modal || !finalScoreDisplay) {
        console.error('Game Over modal or final score display not found');
        return;
    }
    finalScoreDisplay.textContent = finalScore;
    modal.style.display = 'flex';
}

function restartGame() {
    console.log('Начало перезапуска игры');

    // Останавливаем и очищаем ticker
    if (app && app.ticker) {
        app.ticker.stop();
        app.ticker.remove(() => {});
        console.log('Ticker остановлен и очищен');
    }

    // Удаляем препятствия из сцены
    obstacles.forEach(obstacle => {
        if (obstacle.sprite && app && app.stage) {
            app.stage.removeChild(obstacle.sprite);
            obstacle.sprite.destroy();
        }
    });
    obstacles = [];
    console.log('Obstacles removed:', obstacles.length);

    // Удаляем слушатели событий
    removeEventListeners();

    // Очищаем characterContainer
    if (characterContainer) {
        characterContainer.destroy({ children: true });
        characterContainer = null;
        console.log('CharacterContainer destroyed');
    }

    // Уничтожаем приложение
    if (app) {
        app.destroy(true, { children: true, texture: true, baseTexture: true });
        app = null;
        console.log('PIXI.Application уничтожен');
    }

    // Сбрасываем состояние
    characterFrames = {};
    isTexturesLoaded = false;
    score = 0;
    gameSpeed = 5;
    currentSegment = 1;

    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) {
        scoreDisplay.textContent = `Score: ${score}`;
    }

    const canvas = document.getElementById('characterCanvas');
    if (canvas) {
        canvas.remove();
        console.log('Canvas удалён');
    }

    // Запускаем новую инициализацию с задержкой
    setTimeout(() => {
        initializeGame();
    }, 100);
}

function moveCharacterToSegment(segmentIndex) {
    const segment = document.querySelectorAll('.segment')[segmentIndex];
    const rect = segment.getBoundingClientRect();
    if (characterContainer) {
        characterContainer.y = rect.top + rect.height / 2;
        console.log(`Перемещение персонажа в сегмент ${segmentIndex}, y=${characterContainer.y}`);
    }
}

async function saveScore(score) {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const response = await fetch('/api/save-score', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score, level_reached: 1 })
        });
        if (!response.ok) throw new Error('Failed to save score');
        console.log('Score saved successfully (single call)');
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing game.js');

    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found, redirecting to /');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
        return;
    }

    const backButton = document.getElementById('backButton');
    if (backButton) {
        console.log('Back button found, adding event listener');
        backButton.addEventListener('click', () => {
            console.log('Back button clicked, redirecting to /');
            window.location.href = '/';
        });
    } else {
        console.error('Back button not found');
    }

    const returnToMenuBtn = document.getElementById('returnToMenuBtn');
    const restartGameBtn = document.getElementById('restartGameBtn');

    if (returnToMenuBtn) {
        returnToMenuBtn.addEventListener('click', () => {
            const modal = document.getElementById('gameOverModal');
            if (modal) {
                modal.style.display = 'none';
            }
            window.location.href = '/';
        });
    }

    if (restartGameBtn) {
        restartGameBtn.addEventListener('click', () => {
            const modal = document.getElementById('gameOverModal');
            if (modal) {
                modal.style.display = 'none';
            }
            restartGame();
        });
    }

    getProfile(token).then(userData => {
        console.log('User data received:', userData);
        if (userData) {
            initializeGame();
        } else {
            console.log('No user data, logging out');
            localStorage.removeItem('token');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
    }).catch(err => {
        console.error('Ошибка при загрузке профиля:', err);
        localStorage.removeItem('token');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    });
});