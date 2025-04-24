// Инициализация PixiJS приложения
function initPixiSidebar() {
    // Создаем приложение PixiJS
    const app = new PIXI.Application({
        width: 180, // Ширина canvas (учитываем padding боковой панели)
        height: 280, // Высота canvas
        backgroundColor: 0x1A1F3E, // Цвет фона соответствует #1A1F3E
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });

    // Добавляем canvas в #sidebarCanvas
    const canvas = document.getElementById('sidebarCanvas');
    if (!canvas) {
        console.error('Sidebar canvas not found');
        return;
    }
    canvas.appendChild(app.view);

    // Загрузка ассетов
    const assets = [
        { name: 'biker', url: '/static/public/assets/characters/biker/Biker_idle.png' },
        { name: 'cyborg', url: '/static/public/assets/characters/cyborg/Cyborg_idle.png' },
        { name: 'punk', url: '/static/public/assets/characters/punk/Punk_idle.png' }
    ];

    PIXI.Assets.load(assets).then((resources) => {
        // Создаем анимированные спрайты для каждого персонажа
        const animatedSprites = [];
        assets.forEach((asset, index) => {
            const texture = resources[asset.name];
            
            // Разделяем sprite sheet на кадры
            const frameWidth = texture.width / 4; // Предполагаем 4 кадра
            const frameHeight = texture.height; // Высота кадра равна высоте текстуры
            const frames = [];

            for (let i = 0; i < 4; i++) {
                const frame = new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight);
                const frameTexture = new PIXI.Texture(texture.baseTexture, frame);
                frames.push(frameTexture);
            }

            // Создаем анимированный спрайт
            const animatedSprite = new PIXI.AnimatedSprite(frames);
            
            // Настраиваем анимацию
            animatedSprite.animationSpeed = 0.1; // Скорость анимации (настройте по желанию)
            animatedSprite.play(); // Запускаем анимацию
            
            // Масштабируем спрайт
            animatedSprite.scale.set(1.0); // Настройте масштаб, если нужно
            
            // Позиционируем спрайты вертикально
            animatedSprite.x = 90; // Центрируем по горизонтали
            animatedSprite.y = 50 + index * 80; // Размещаем с отступом 80px (уменьшено из-за размера)
            animatedSprite.anchor.set(0.5); // Центрируем спрайт
            
            animatedSprites.push(animatedSprite);
            app.stage.addChild(animatedSprite);
        });
    }).catch((error) => {
        console.error('Ошибка загрузки ассетов:', error);
    });
}

// Добавление вызова initPixiSidebar при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const gameScene = document.getElementById('gameScene');
    if (gameScene && !gameScene.classList.contains('hidden')) {
        initPixiSidebar();
    }
    // ... остальной код ...
});

// Вызов initPixiSidebar после авторизации
const authForm = document.getElementById('authForm');
if (authForm) {
    authForm.addEventListener('submit', function (event) {
        // ... существующий код ...
        if (data.success) {
            showMessage('Авторизация успешна');
            setTimeout(() => {
                document.getElementById('authModal').style.display = 'none';
                showGameScene();
                initPixiSidebar(); // Инициализация PixiJS после авторизации
            }, 1000);
        }
        // ... остальной код ...
    });
}

// Вызов initPixiSidebar после регистрации
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function (event) {
        // ... существующий код ...
        if (data.success) {
            showMessage('Регистрация успешна!');
            setTimeout(() => {
                document.getElementById('registerModal').style.display = 'none';
                showGameScene();
                initPixiSidebar(); // Инициализация PixiJS после регистрации
            }, 1000);
        }
        // ... остальной код ...
    });
}

// Вызов initPixiSidebar в showGameScene
function showGameScene() {
    // ... существующий код ...
    initPixiSidebar(); // Инициализация PixiJS при открытии gameScene
}