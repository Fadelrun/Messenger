// Обработчик входа
export async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const username = form.username.value.trim();
    const password = form.password.value.trim();
    const errorElement = document.getElementById('error');
    
    errorElement.textContent = '';
    
    if (!username || !password) {
        errorElement.textContent = 'Заполните все поля';
        return;
    }

    try {
        form.querySelector('button[type="submit"]').disabled = true;
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = '/';
        } else {
            errorElement.textContent = data.message || 'Ошибка входа';
        }
    } catch (err) {
        errorElement.textContent = 'Ошибка сети';
    } finally {
        form.querySelector('button[type="submit"]').disabled = false;
    }
}

// Обработчик регистрации
export async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const username = form.username.value.trim();
    const password = form.password.value.trim();
    const errorElement = document.getElementById('error');
    
    errorElement.textContent = '';
    
    if (!username || !password) {
        errorElement.textContent = 'Заполните все поля';
        return;
    }

    try {
        form.querySelector('button[type="submit"]').disabled = true;
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = '/';
        } else {
            errorElement.textContent = data.message || 'Ошибка регистрации';
        }
    } catch (err) {
        console.log('error')
        errorElement.textContent = 'Ошибка хуй';
    } finally {
        form.querySelector('button[type="submit"]').disabled = false;
    }
}

// Инициализация форм
export function initAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        loginForm.addEventListener('input', () => {
            document.getElementById('error').textContent = '';
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        registerForm.addEventListener('input', () => {
            document.getElementById('error').textContent = '';
        });
    }
}

// Автоматическая инициализация при загрузке
document.addEventListener('DOMContentLoaded', initAuthForms);