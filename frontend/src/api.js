
export function registerUser(email, password) {
    return fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json());
}

export function authenticateUser(email, password) {
    return fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json());
}
