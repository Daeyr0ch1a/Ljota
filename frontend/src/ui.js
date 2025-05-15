import { loginUser, registerUser, getProfile } from './api.js';
import { showGameScene } from './pixi.js';

// Функция для заполнения таблицы рекордов
async function populateRecordsTable() {
    const recordsBody = document.getElementById('recordsBody');
    if (!recordsBody) return;

    const token = localStorage.getItem('token');
    if (!token) {
        recordsBody.innerHTML = '<tr><td colspan="3">Пожалуйста, войдите в систему</td></tr>';
        return;
    }

    try {
        const response = await fetch('/api/records', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
        }
        const records = await response.json();
        recordsBody.innerHTML = '';
        if (records.length === 0) {
            recordsBody.innerHTML = '<tr><td colspan="3">Нет рекордов</td></tr>';
            return;
        }
        records.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.place}</td>
                <td>${record.name}</td>
                <td>${record.score}</td>
            `;
            recordsBody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка загрузки рекордов:', error);
        recordsBody.innerHTML = '<tr><td colspan="3">Ошибка загрузки данных</td></tr>';
        setTimeout(() => {
            window.location.href = '/'; // Перенаправляем на экран входа при ошибке
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Снимаем класс hidden с body после загрузки DOM
    document.body.classList.remove('hidden');

    // Проверка токена при загрузке
    const token = localStorage.getItem('token');
    if (token) {
        getProfile(token).then(userData => {
            if (userData) {
                showGameScene(); // Показываем gameScene, если токен валиден
            } else {
                localStorage.removeItem('token');
                showMessage('Сессия истекла, войдите снова', true);
            }
        }).catch(err => {
            console.error('Ошибка при проверке токена:', err);
            localStorage.removeItem('token');
            showMessage('Ошибка проверки сессии, войдите снова', true);
        });
    } else {
        // Если токена нет, ничего не делаем, ждём нажатия "Начать"
    }

    // Обработчик кнопки "Начать"
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function () {
            const token = localStorage.getItem('token');
            const registerModal = document.getElementById('registerModal');
            if (!token && registerModal) {
                registerModal.style.display = 'flex';
                registerModal.classList.remove('hidden');
                document.getElementById('intro').style.display = 'none';
            } else if (token) {
                showGameScene(); // Показываем gameScene, если токен есть
            }
        });
    }

    // Закрытие модалок по клику на крестик
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modalId = closeBtn.getAttribute('data-close');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                modal.classList.add('hidden');
                if (modalId === 'authModal' || modalId === 'registerModal') {
                    document.getElementById('intro').style.display = 'flex';
                }
                if (modalId === 'profileModal') {
                    const gameScene = document.getElementById('gameScene');
                    if (gameScene) {
                        gameScene.style.display = 'block';
                        gameScene.classList.remove('hidden');
                    }
                }
            }
        });
    });

    // Обработка входа (авторизация)
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            loginUser(email, password).then(data => {
                if (data.success) {
                    showMessage('Авторизация успешна');
                    setTimeout(() => {
                        document.getElementById('authModal').style.display = 'none';
                        showGameScene(); // Переход к игре после авторизации
                    }, 1000);
                } else {
                    showMessage(data.message || 'Неверный логин или пароль', true);
                }
            });
        });
    }

    // Переключение с регистрации на авторизацию
    const openAuthModal = document.getElementById('openAuthModal');
    if (openAuthModal) {
        openAuthModal.addEventListener('click', () => {
            document.getElementById('registerModal').style.display = 'none';
            document.getElementById('registerModal').classList.add('hidden');
            const authModal = document.getElementById('authModal');
            if (authModal) {
                authModal.style.display = 'flex';
                authModal.classList.remove('hidden');
            }
        });
    }

    // Переключение с авторизации на регистрацию
    const openRegisterModal = document.getElementById('openRegisterModal');
    if (openRegisterModal) {
        openRegisterModal.addEventListener('click', () => {
            document.getElementById('authModal').style.display = 'none';
            document.getElementById('authModal').classList.add('hidden');
            const registerModal = document.getElementById('registerModal');
            if (registerModal) {
                registerModal.style.display = 'flex';
                registerModal.classList.remove('hidden');
            }
        });
    }

    // Обработка регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value.trim();
            const birthDate = document.getElementById('birthDate').value;
            const gender = document.getElementById('gender').value;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Неверный формат email', true);
                return;
            }

            if (password.length < 6) {
                showMessage('Пароль должен содержать минимум 6 символов', true);
                return;
            }

            if (!name) {
                showMessage('Введите имя', true);
                return;
            }

            if (!gender) {
                showMessage('Выберите пол', true);
                return;
            }

            if (!birthDate) {
                showMessage('Введите дату рождения', true);
                return;
            }

            const payload = {
                email,
                password,
                name,
                data_users: {
                    gender,
                    birthDate: new Date(birthDate).toISOString().split('T')[0]
                }
            };

            registerUser(payload).then(data => {
                if (data.success) {
                    showMessage('Регистрация успешна!');
                    setTimeout(() => {
                        document.getElementById('registerModal').style.display = 'none';
                        showGameScene(); // Переход к игре после регистрации
                    }, 1000);
                } else {
                    showMessage(data.error || 'Ошибка регистрации', true);
                }
            });
        });
    }

    // Обработчики кнопок в шапке gameScene
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', () => {
            const sidebar = document.getElementById('leftSidebar');
            const recordsTable = document.getElementById('recordsTable');
            if (sidebar && recordsTable) {
                sidebar.classList.toggle('collapsed');
                recordsTable.classList.toggle('full-width');
                const isCollapsed = sidebar.classList.contains('collapsed');
                toggleSidebarBtn.setAttribute('title', isCollapsed ? 'Развернуть меню персонажа' : 'Свернуть меню персонажа');
                showMessage(isCollapsed ? 'Меню персонажа свёрнуто' : 'Меню персонажа развёрнуто');
            }
        });
    }

    const accountBtn = document.getElementById('accountBtn');
    if (accountBtn) {
        accountBtn.addEventListener('click', async () => {
            const profileModal = document.getElementById('profileModal');
            if (!profileModal) {
                showMessage('Ошибка: модальное окно профиля не найдено', true);
                return;
            }

            profileModal.style.display = 'flex';
            profileModal.classList.remove('hidden');

            profileModal.style.position = 'fixed';
            profileModal.style.top = '0';
            profileModal.style.left = '0';
            profileModal.style.width = '100%';
            profileModal.style.height = '100%';
            profileModal.style.background = 'rgba(0, 0, 0, 0.7)';
            profileModal.style.zIndex = '1000';
            profileModal.style.justifyContent = 'center';
            profileModal.style.alignItems = 'center';

            const modalContent = profileModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.background = '#1A1F3E';
                modalContent.style.padding = '20px';
                modalContent.style.borderRadius = '10px';
                modalContent.style.width = '90%';
                modalContent.style.maxWidth = '400px';
                modalContent.style.boxShadow = '0 0 20px #60A5FA';
                modalContent.style.color = 'white';
            }

            const closeModalOnBackground = (event) => {
                if (event.target === profileModal) {
                    profileModal.style.display = 'none';
                    profileModal.classList.add('hidden');
                    const gameScene = document.getElementById('gameScene');
                    if (gameScene) {
                        gameScene.style.display = 'block';
                        gameScene.classList.remove('hidden');
                    }
                }
            };
            profileModal.addEventListener('click', closeModalOnBackground);

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    document.getElementById('profileInfo').innerHTML = `
                        <p style="color: tomato;">Токен отсутствует, пожалуйста, войдите снова</p>
                        <button id="redirectToLogin">Перейти к авторизации</button>
                    `;
                    document.getElementById('redirectToLogin').addEventListener('click', () => {
                        profileModal.style.display = 'none';
                        profileModal.classList.add('hidden');
                        const gameScene = document.getElementById('gameScene');
                        const intro = document.getElementById('intro');
                        const mainHeader = document.querySelector('header:not(#gameHeader)');
                        if (gameScene) {
                            gameScene.style.display = 'none';
                            gameScene.classList.add('hidden');
                        }
                        if (intro) intro.style.display = 'flex';
                        if (mainHeader) mainHeader.style.display = 'block';
                    });
                    return;
                }

                const userData = await getProfile(token);
                if (userData) {
                    document.getElementById('profileName').textContent = userData.name || 'Не указано';
                    document.getElementById('profileEmail').textContent = userData.email || 'Не указано';
                    document.getElementById('profileGender').textContent = userData.data_users?.gender || 'Не указано';
                    document.getElementById('profileBirthDate').textContent = userData.data_users?.birthDate || 'Не указано';
                    showMessage('Профиль открыт');
                } else {
                    document.getElementById('profileInfo').innerHTML = `
                        <p style="color: tomato;">Не удалось загрузить данные профиля</p>
                        <button id="redirectToLogin">Перейти к авторизации</button>
                    `;
                    localStorage.removeItem('token');
                    document.getElementById('redirectToLogin').addEventListener('click', () => {
                        profileModal.style.display = 'none';
                        profileModal.classList.add('hidden');
                        const gameScene = document.getElementById('gameScene');
                        const intro = document.getElementById('intro');
                        const mainHeader = document.querySelector('header:not(#gameHeader)');
                        if (gameScene) {
                            gameScene.style.display = 'none';
                            gameScene.classList.add('hidden');
                        }
                        if (intro) intro.style.display = 'flex';
                        if (mainHeader) mainHeader.style.display = 'block';
                    });
                }
            } catch (err) {
                console.error('Ошибка при загрузке профиля:', err);
                document.getElementById('profileInfo').innerHTML = `
                    <p style="color: tomato;">Ошибка загрузки профиля: ${err.message}</p>
                    <button id="redirectToLogin">Перейти к авторизации</button>
                `;
                localStorage.removeItem('token');
                document.getElementById('redirectToLogin').addEventListener('click', () => {
                    profileModal.style.display = 'none';
                    profileModal.classList.add('hidden');
                    const gameScene = document.getElementById('gameScene');
                    const intro = document.getElementById('intro');
                    const mainHeader = document.querySelector('header:not(#gameHeader)');
                    if (gameScene) {
                        gameScene.style.display = 'none';
                        gameScene.classList.add('hidden');
                    }
                    if (intro) intro.style.display = 'flex';
                    if (mainHeader) mainHeader.style.display = 'block';
                });
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            showMessage('Выход выполнен');
            setTimeout(() => {
                const gameScene = document.getElementById('gameScene');
                const intro = document.getElementById('intro');
                const mainHeader = document.querySelector('header:not(#gameHeader)');
                if (gameScene) {
                    gameScene.style.display = 'none';
                    gameScene.classList.add('hidden');
                }
                if (intro) intro.style.display = 'flex';
                if (mainHeader) mainHeader.style.display = 'block';
            }, 1000);
        });
    }

    // Обработчик нижней ссылки
    const bottomLink = document.getElementById('bottomLink');
    if (bottomLink) {
        bottomLink.addEventListener('click', (event) => {
            event.preventDefault();
            showMessage('Переход к игре...');
            setTimeout(() => {
                window.location.href = '/games';
            }, 1000);
        });
    }

    function showMessage(message, isError = false) {
        const box = document.getElementById('messageBox');
        if (box) {
            box.textContent = message;
            box.style.color = isError ? 'tomato' : 'lightgreen';
            box.style.display = 'block';
            setTimeout(() => box.style.display = 'none', 3000);
        }
    }
});

export { populateRecordsTable };