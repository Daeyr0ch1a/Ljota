import { loginUser, registerUser } from './api.js';



document.addEventListener('DOMContentLoaded', () => {
    // Обработчик кнопки "Начать" — открывает модальное окно регистрации
    const startBtn = document.getElementById('startBtn');
    if (!startBtn) {
        return;
    }
    startBtn.addEventListener('click', function () {
        const registerModal = document.getElementById('registerModal');
        if (!registerModal) {
            return;
        }
        registerModal.style.display = 'flex';
        registerModal.classList.remove('hidden');
        document.getElementById('intro').style.display = 'none';
    });

    // Закрытие всех модалок по клику на крестик
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modalId = closeBtn.getAttribute('data-close');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                modal.classList.add('hidden');
                document.getElementById('intro').style.display = 'flex';
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
                        document.getElementById('gameScene').classList.remove('hidden');
                        document.getElementById('gameScene').style.display = 'block';
                    }, 1000);
                } else {
                    showMessage('Неверный логин или пароль', true);
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
            authModal.style.display = 'flex';
            authModal.classList.remove('hidden');
        });
    }

    // Переключение с авторизации на реистрацию
    const openRegisterModal = document.getElementById('openRegisterModal');
    if (openRegisterModal) {
        openRegisterModal.addEventListener('click', () => {
            document.getElementById('authModal').style.display = 'none';
            document.getElementById('authModal').classList.add('hidden');
            const registerModal = document.getElementById('registerModal');
            registerModal.style.display = 'flex';
            registerModal.classList.remove('hidden');
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
                        document.getElementById('gameScene').classList.remove('hidden');
                        document.getElementById('gameScene').style.display = 'block';
                    }, 1000);
                } else {
                    showMessage(data.error || 'Ошибка регистрации', true);
                }
            });
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