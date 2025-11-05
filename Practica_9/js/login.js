// Espera a que todo el contenido del HTML se cargue
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Definición de la "llave" para la BD de usuarios ---
    // Aquí es donde guardaremos la lista de usuarios registrados
    const USERS_KEY = 'usuarios_db';

    // --- 2. Obtener referencias a los elementos del DOM ---
    
    // Formularios
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Enlaces para alternar
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');

    // Campos de Login
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const loginErrorMessage = document.getElementById('login-error-message');

    // Campos de Registro
    const registerUsernameInput = document.getElementById('register-username');
    const registerRolInput = document.getElementById('register-rol');
    const registerPasswordInput = document.getElementById('register-password');
    const registerConfirmPasswordInput = document.getElementById('register-confirm-password');
    const registerErrorMessage = document.getElementById('register-error-message');
    const registerSuccessMessage = document.getElementById('register-success-message');


    // --- 3. Funciones Helper (Ayudantes) para Local Storage ---

    /**
     * Obtiene todos los usuarios de Local Storage.
     * @returns {Array} Un array de objetos de usuario.
     */
    const getUsers = () => {
        const usersJSON = localStorage.getItem(USERS_KEY);
        return usersJSON ? JSON.parse(usersJSON) : [];
    };

    /**
     * Guarda un array de usuarios en Local Storage.
     * @param {Array} users - El array de usuarios completo.
     */
    const saveUsers = (users) => {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    };


    // --- 4. Funciones para alternar Vistas (Login/Registro) ---

    const showRegisterView = () => {
        loginForm.style.display = 'none';    // Oculta login
        registerForm.style.display = 'block'; // Muestra registro
        loginErrorMessage.style.display = 'none'; // Limpia errores
    };

    const showLoginView = () => {
        registerForm.style.display = 'none'; // Oculta registro
        loginForm.style.display = 'block';   // Muestra login
        registerErrorMessage.style.display = 'none'; // Limpia errores
        registerSuccessMessage.style.display = 'none';
    };


    // --- 5. Lógica de Registro ---

    /**
     * Maneja el envío del formulario de registro.
     */
    const handleRegister = (event) => {
        event.preventDefault(); // Prevenimos el envío

        // Obtenemos los valores
        const username = registerUsernameInput.value.trim();
        const rol = registerRolInput.value;
        const password = registerPasswordInput.value;
        const confirmPassword = registerConfirmPasswordInput.value;

        // Limpiamos mensajes previos
        registerErrorMessage.style.display = 'none';
        registerSuccessMessage.style.display = 'none';

        // --- Validaciones ---
        if (password !== confirmPassword) {
            registerErrorMessage.textContent = 'Las contraseñas no coinciden.';
            registerErrorMessage.style.display = 'block';
            return;
        }

        if (password.length < 4) {
            registerErrorMessage.textContent = 'La contraseña debe tener al menos 4 caracteres.';
            registerErrorMessage.style.display = 'block';
            return;
        }

        if (rol === "") {
            registerErrorMessage.textContent = 'Por favor, seleccione un rol.';
            registerErrorMessage.style.display = 'block';
            return;
        }

        // --- Verificación de Usuario Existente ---
        const users = getUsers();
        const userExists = users.some(user => user.username.toLowerCase() === username.toLowerCase());

        if (userExists) {
            registerErrorMessage.textContent = 'El nombre de usuario ya está en uso.';
            registerErrorMessage.style.display = 'block';
            return;
        }

        // --- Si todo está OK, creamos y guardamos el usuario ---
        const newUser = {
            id: `user_${Date.now()}`,
            username: username,
            password: password, // ¡NOTA: En una app real, esto debe ser "hasheado"!
            rol: rol
        };

        // Añadimos el nuevo usuario al array
        users.push(newUser);
        // Guardamos el array actualizado en Local Storage
        saveUsers(users);

        // Mostramos mensaje de éxito y limpiamos el formulario
        registerSuccessMessage.textContent = '¡Registro exitoso! Ahora puedes iniciar sesión.';
        registerSuccessMessage.style.display = 'block';
        registerForm.reset();

        // Opcional: mover al login automáticamente después de 2 segundos
        setTimeout(() => {
            showLoginView();
        }, 2000);
    };


    // --- 6. Lógica de Login (Actualizada) ---

    /**
     * Maneja el envío del formulario de login.
     */
    const handleLogin = (event) => {
        event.preventDefault(); // Prevenimos el envío

        // Obtenemos los valores
        const username = loginUsernameInput.value;
        const password = loginPasswordInput.value;

        // Limpiamos mensajes previos
        loginErrorMessage.style.display = 'none';

        // --- Búsqueda del Usuario ---
        const users = getUsers();
        
        // Buscamos un usuario que coincida en nombre Y contraseña
        // NOTA: Esto es inseguro en el mundo real, pero cumple con
        // el requisito de "solo Local Storage".
        const foundUser = users.find(user => 
            user.username === username && 
            user.password === password
        );

        if (foundUser) {
            // --- ÉXITO ---
            // Guardamos que el usuario está autenticado
            localStorage.setItem('isAuthenticated', 'true');
            // Guardamos su rol (para futuros permisos)
            localStorage.setItem('userRole', foundUser.rol);
            // Guardamos su nombre (para mostrar "Hola, Admin")
            localStorage.setItem('username', foundUser.username);

            // Redirigimos al dashboard (index.html)
            window.location.href = 'index.html';

        } else {
            // --- FALLO ---
            // Si no se encuentra, mostramos un mensaje de error
            loginErrorMessage.textContent = 'Usuario o contraseña incorrectos.';
            loginErrorMessage.style.display = 'block';
        }
    };


    // --- 7. Asignación de Eventos ---

    // Asignamos las funciones a los eventos 'submit' de los formularios
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    // Asignamos las funciones a los 'click' de los enlaces
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault(); // Evita que el enlace '#' recargue la página
        showRegisterView();
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginView();
    });

});