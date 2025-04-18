document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('authModal').style.display = 'none';
});

document.getElementById('startBtn').addEventListener('click', function () {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('intro').style.display = 'none';
});

document.getElementById('registerBtn').addEventListener('click', function () {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    registerUser(email, password);
});

document.getElementById('authForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    authenticateUser(email, password);
});

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
                document.getElementById('gameScene').style.display = 'block';
                document.getElementById('authModal').style.display = 'none';
                document.getElementById('messageBox').style.display = 'none';
            }, 1000);
        } else {
            showMessage('Неверный логин или пароль', true);
        }
    });
}
