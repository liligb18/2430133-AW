// --- Funciones de Utilidad para cambiar de vista ---
function showLogin() {
    document.getElementById('login-view').style.display = 'block';
    document.getElementById('register-view').style.display = 'none';
    document.getElementById('welcome-view').style.display = 'none';
    clearMessages();
}

function showRegister() {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('register-view').style.display = 'block';
    document.getElementById('welcome-view').style.display = 'none';
    clearMessages();
}

function showWelcome(email) {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('register-view').style.display = 'none';
    document.getElementById('welcome-view').style.display = 'block';
    document.getElementById('welcomeMessage').textContent = 'Bienvenido: ' + email;
}

function clearMessages() {
    // Oculta todos los mensajes de error o éxito
    document.getElementById('loginMessage').style.display = 'none';
    document.getElementById('registerMessage').style.display = 'none';
}


// --- Función de Registro (Guarda en LocalStorage) ---
function register() {
    clearMessages();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const messageElement = document.getElementById('registerMessage');

    if (email.trim() === '' || password.trim() === '') {
        messageElement.textContent = 'Por favor, rellena ambos campos.';
        messageElement.classList.remove('success');
        messageElement.classList.add('error');
        messageElement.style.display = 'block';
        return;
    }

    // Simula la base de datos: guarda un objeto en LocalStorage
    localStorage.setItem('user', JSON.stringify({ email: email, password: password }));
    
    messageElement.textContent = '¡Registro exitoso! Ahora puedes iniciar sesión.';
    messageElement.classList.remove('error');
    messageElement.classList.add('success');
    messageElement.style.display = 'block';
    
    // Opcional: limpiar campos y cambiar a la vista de login después de 2 segundos
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    setTimeout(showLogin, 2000); 
}


// --- Función de Login (Verifica con LocalStorage) ---
function login() {
    clearMessages();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const messageElement = document.getElementById('loginMessage');
    
    // Recupera el usuario guardado
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (!storedUser) {
        messageElement.textContent = 'Aún no hay usuarios registrados. Regístrate primero.';
        messageElement.style.display = 'block';
        return;
    }

    if (email === storedUser.email && password === storedUser.password) {
        // Inicio de sesión exitoso
        showWelcome(email);
    } else {
        // Credenciales incorrectas
        messageElement.textContent = 'Correo o contraseña incorrectos.';
        messageElement.style.display = 'block';
    }
}


// --- Función de Cerrar Sesión ---
function logout() {
    // Vuelve a la vista de Login
    showLogin();
}