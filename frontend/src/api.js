export async function registerUser(email, password, gender) {
    // Валидация полей
    if (!email || !password || !gender) {
        console.log('Валидация не пройдена:', { email, password, gender });
        return { success: false, error: 'Все поля должны быть заполнены' };
    }

    const payload = { email, password, data_users: { gender } };
    console.log('Отправляемый запрос:', payload);

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        console.log('Ответ сервера:', data);
        return data;
    } catch (error) {
        console.log('Ошибка fetch:', error);
        return { success: false, error: error.message };
    }
}

export async function authenticateUser(email, password) {
    // Валидация полей
    if (!email || !password) {
        console.log('Валидация не пройдена:', { email, password });
        return { success: false, error: 'Email и пароль должны быть заполнены' };
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        console.log('Ответ сервера:', data);
        return data;
    } catch (error) {
        console.log('Ошибка fetch:', error);
        return { success: false, error: error.message };
    }
}