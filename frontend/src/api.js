function showMessage(message, isError = false) {
    const box = document.getElementById('messageBox');
    box.textContent = message;
    box.style.color = isError ? 'tomato' : 'lightgreen';
    box.style.display = 'block';
}

function registerUser(email, password) {
    fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('Регистрация прошла успешно');
        } else {
            showMessage('Ошибка регистрации', true);
        }
    });
}

function authenticateUser(email, password) {
    fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('Авторизация успешна');
            setTimeout(() => {
                // Переход к игровой сцене
                document.getElementById('authModal').style.display = 'none';
                document.getElementById('gameScene').classList.remove('hidden');
            }, 1000);
        } else {
            showMessage('Неверный логин или пароль', true);
        }
    });
}
