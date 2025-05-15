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

        const data = await response.json();
        console.log('Ответ от /api/register:', data); // Логирование для отладки
        if (data.success && data.access_token) {
            localStorage.setItem("token", data.access_token);
        }
        return data;
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
        console.log('Ответ от /api/login:', data); // Логирование для отладки
        if (data.access_token) {
            localStorage.setItem("token", data.access_token);
        }

        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Получение текущего пользователя по токену
export async function getProfile(token) {
    try {
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Не удалось загрузить профиль: ${response.status}`);
        }
        const data = await response.json();
        console.log('Ответ от /api/profile:', data); // Логирование для отладки
        return data;
    } catch (error) {
        console.error('Ошибка в getProfile:', error);
        return null;
    }
}

// Выход из системы
export function logoutUser() {
    localStorage.removeItem("token");
    location.reload();
}