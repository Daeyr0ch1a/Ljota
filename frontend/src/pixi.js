import * as PIXI from 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.4.0/pixi.min.mjs';
import { populateRecordsTable } from './ui.js';
import { getCurrentSpriteIndex, setCurrentSpriteIndex } from './state.js';

let pixiApp = null;
const animatedSprites = [];

function isWebGLSupported() {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
}

function switchSprite() {
    console.log('Вызвана функция switchSprite');
    const newIndex = (getCurrentSpriteIndex() + 1) % animatedSprites.length;
    console.log(`Переключение на персонаж с индексом: ${newIndex}`);
    setCurrentSpriteIndex(newIndex);
    animatedSprites.forEach((spriteContainer, index) => {
        spriteContainer.visible = (index === newIndex);
    });
    const spriteNames = ['Biker', 'Cyborg', 'Punk'];
    showMessage(`Персонаж: ${spriteNames[newIndex]}`);
}

function initPixiSidebar() {
    const canvas = document.getElementById('sidebarCanvas');
    if (!canvas) {
        console.log('Sidebar canvas not found, skipping initialization');
        return;
    }

    if (!isWebGLSupported()) {
        console.error('WebGL не поддерживается в этом браузере');
        showMessage('Ошибка: WebGL не поддерживается');
        return;
    }
    if (pixiApp) {
        console.log('PixiJS уже инициализировано');
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 200;
    const height = rect.height || 247;
    console.log(`Размеры канваса: ширина=${width}, высота=${height}`);

    try {
        pixiApp = new PIXI.Application({
            view: canvas,
            width: width,
            height: height,
            backgroundColor: 0x1A1F3E,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });
    } catch (error) {
        console.error('Ошибка инициализации PixiJS:', error);
        showMessage('Ошибка инициализации графики');
        return;
    }
    canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        console.warn('WebGL context lost in sidebar');
        showMessage('Ошибка: потерян WebGL-контекст');
        pixiApp.stage.removeChildren();
    });
    canvas.addEventListener('webglcontextrestored', () => {
        console.log('WebGL context restored in sidebar');
        animatedSprites.length = 0;
        pixiApp.stage.removeChildren();
        loadAssets();
    });

    function loadAssets() {
        const assets = [
            { name: 'biker', url: '/static/public/assets/characters/biker/Biker_idle.png' },
            { name: 'cyborg', url: '/static/public/assets/characters/cyborg/Cyborg_idle.png' },
            { name: 'punk', url: '/static/public/assets/characters/punk/Punk_idle.png' }
        ];
        PIXI.Assets.load(assets.map(a => a.url)).then((textures) => {
            console.log('Ассеты загружены:', textures);
            assets.forEach((asset, index) => {
                const texture = textures[asset.url];
                if (!texture) {
                    console.error(`Текстура для ${asset.name} не загружена`);
                    return;
                }

                const frameCount = 4;
                const frameWidth = texture.width / frameCount;
                const frameHeight = texture.height;

                const frames = [];
                for (let i = 0; i < frameCount; i++) {
                    const frame = new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight);
                    const frameTexture = new PIXI.Texture(texture.baseTexture, frame);
                    frames.push(frameTexture);
                }

                const animatedSprite = new PIXI.AnimatedSprite(frames);
                animatedSprite.animationSpeed = 0.1;
                animatedSprite.play();
                animatedSprite.anchor.set(0.5);

                const targetHeight = 120;
                const scaleFactor = targetHeight / frameHeight;
                animatedSprite.scale.set(scaleFactor);
                console.log(`Масштаб спрайта: scaleFactor=${scaleFactor}, итоговая высота=${frameHeight * scaleFactor}, итоговая ширина=${frameWidth * scaleFactor}`);

                const spriteContainer = new PIXI.Container();
                spriteContainer.width = 200;
                spriteContainer.height = 247;
                spriteContainer.addChild(animatedSprite);

                animatedSprite.x = spriteContainer.width / 2;
                animatedSprite.y = spriteContainer.height / 2;

                spriteContainer.x = width / 2;
                spriteContainer.y = height / 2;
                spriteContainer.visible = (index === getCurrentSpriteIndex());

                console.log(`Позиция spriteContainer: x=${spriteContainer.x}, y=${spriteContainer.y}`);
                console.log(`Позиция animatedSprite внутри контейнера: x=${animatedSprite.x}, y=${animatedSprite.y}`);

                animatedSprites.push(spriteContainer);
                pixiApp.stage.addChild(spriteContainer);
            });

            const switchSpriteBtn = document.getElementById('switchSpriteBtn');
            if (switchSpriteBtn) {
                console.log('Кнопка switchSpriteBtn найдена, добавляем обработчик');
                switchSpriteBtn.addEventListener('click', switchSprite);
            } else {
                console.error('Кнопка switchSpriteBtn не найдена');
            }
        }).catch((error) => {
            console.error('Ошибка загрузки ассетов:', error);
            showMessage('Ошибка загрузки ресурсов');
        });
    }
    loadAssets();
}

async function showGameScene() {
    const intro = document.getElementById('intro');
    const gameScene = document.getElementById('gameScene');
    if (!intro || !gameScene) {
        return;
    }
    const mainHeader = document.querySelector('header:not(#gameHeader)');
    const mainFooter = document.querySelector('footer');
    const gameHeader = document.getElementById('gameHeader');
    if (intro) intro.style.display = 'none';
    if (mainFooter) mainFooter.style.display = 'none';
    if (gameScene) {
        gameScene.classList.remove('hidden');
        gameScene.style.display = 'block';
    }
    if (mainHeader) mainHeader.style.display = 'none';
    if (gameHeader) gameHeader.style.display = 'flex';
    initPixiSidebar();
    await populateRecordsTable();
    await loadRecords();
}

async function loadRecords() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('No token found, cannot load records');
        const recordsBody = document.getElementById('recordsBody');
        if (recordsBody) {
            recordsBody.innerHTML = '<tr><td colspan="3">Пожалуйста, войдите в систему</td></tr>';
        }
        return;
    }
    try {
        const response = await fetch('/api/records', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch records');
        const records = await response.json();
        console.log('Records loaded:', records);

        const recordsBody = document.getElementById('recordsBody');
        if (recordsBody) {
            recordsBody.innerHTML = '';
            if (records.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="3">Рекордов пока нет</td>`;
                recordsBody.appendChild(row);
            } else {
                records.forEach(record => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${record.place}</td>
                        <td>${record.name}</td>
                        <td>${record.score}</td>
                    `;
                    recordsBody.appendChild(row);
                });
            }
        } else {
            console.warn('recordsBody element not found, possibly on a different page');
        }
    } catch (error) {
        console.error('Error loading records:', error);
        const recordsBody = document.getElementById('recordsBody');
        if (recordsBody) {
            recordsBody.innerHTML = '<tr><td colspan="3">Ошибка загрузки данных</td></tr>';
        }
    }
}

function showMessage(message, isError = false) {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) {
        console.error('messageBox не найден');
        return;
    }
    messageBox.textContent = message;
    messageBox.style.color = isError ? 'tomato' : 'lightgreen';
    messageBox.style.display = 'block';
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000);
}

export { initPixiSidebar, showGameScene, loadRecords };