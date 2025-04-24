// Регистрация пользователя
export async function registerUser(payload) {
    const { email, password, name, data_users } = payload;

    if (!email || !password || !name || !data_users?.gender || !data_users?.birthDate) {
        return { success: false, error: 'Все поля должны быть заполнены' };
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        return await response.json();
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Авторизация пользователя
export async function loginUser(email, password) {
    if (!email || !password) {
        return { success: false, error: 'Email и пароль обязательны' };
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.access_token) {
            localStorage.setItem("token", data.access_token);
        }

        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Получение текущего пользователя по токену
export async function getCurrentUser() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        const response = await fetch('/api/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            return await response.json();
        } else {
            localStorage.removeItem("token");
            return null;
        }
    } catch {
        localStorage.removeItem("token");
        return null;
    }
}

// Выход из системы
export function logoutUser() {
    localStorage.removeItem("token");
    location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (token) {
      
        fetch('/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => {
            if (res.ok) return res.json();
            else throw new Error('Unauthorized');
        })
        .then(user => {
           
            document.getElementById('intro').style.display = 'none';
            document.getElementById('gameScene').classList.remove('hidden');
            document.getElementById('gameScene').style.display = 'block';
        })
        .catch(() => {
            
            localStorage.removeItem('token');
        });
    }
});