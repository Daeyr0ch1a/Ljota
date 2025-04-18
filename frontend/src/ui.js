
import { registerUser, authenticateUser } from './api.js'; 


document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('authModal').style.display = 'none';
});

// Обработчик для кнопки старта
document.getElementById('startBtn').addEventListener('click', function () {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('intro').style.display = 'none';
});

// Обработчик для кнопки регистрации
document.getElementById('registerBtn').addEventListener('click', function () {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    registerUser(email, password).then(data => {
        if (data.success) {
            window.location.href = '/game.html';
        } else {
            showMessage('Ошибка регистрации', true);
        }
    });
});

document.getElementById('authForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    authenticateUser(email, password).then(data => {
        if (data.success) {
            showMessage('Авторизация успешна');
            setTimeout(() => {
                document.getElementById('authModal').style.display = 'none';
                document.getElementById('gameScene').classList.remove('hidden');
            }, 1000);
        } else {
            showMessage('Неверный логин или пароль', true);
        }
    });
});

function showMessage(message, isError = false) {
    const box = document.getElementById('messageBox');
    box.textContent = message;
    box.style.color = isError ? 'tomato' : 'lightgreen';
    box.style.display = 'block';
}
