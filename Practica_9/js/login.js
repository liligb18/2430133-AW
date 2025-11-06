document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Definición de la "llave" para la BD de usuarios ---
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


    // --- 3. Funciones Helper para Local Storage ---

    /**
     * Obtiene todos los usuarios. Crea un 'admin' por defecto si está vacío.
     */
    const getUsers = () => {
        const usersJSON = localStorage.getItem(USERS_KEY);
        if (!usersJSON) {
            const adminDefault = [{
                id: 'user_admin',
                username: 'admin',
                password: '1234',
                rol: 'Admin',
                medicoId: null
            }];
            localStorage.setItem(USERS_KEY, JSON.stringify(adminDefault));
            return adminDefault;
        }
        return JSON.parse(usersJSON);
    };

    /**
     * Guarda un array de usuarios en Local Storage.
     * @param {Array} users
     */
    const saveUsers = (users) => {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    };


    // --- 4. Funciones para alternar Vistas ---

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

        // Limpiamos mensajes previos
        registerErrorMessage.style.display = 'none';
        registerSuccessMessage.style.display = 'none';
        
        try {
            // --- INICIO VALIDACIONES ---
            const username = Validaciones.validarCampoTexto(registerUsernameInput.value, 'Nombre de Usuario');
            const rol = Validaciones.validarCampoTexto(registerRolInput.value, 'Rol');
            const password = Validaciones.validarPassword(registerPasswordInput.value, true); // true = es nuevo, requerido
            const confirmPassword = registerConfirmPasswordInput.value;

            if (password !== confirmPassword) {
                Validaciones.mostrarError('Las contraseñas no coinciden.');
            }

            // --- Verificación de Usuario Existente ---
            const users = getUsers();
            const userExists = users.some(user => user.username.toLowerCase() === username.toLowerCase());

            if (userExists) {
                Validaciones.mostrarError('El nombre de usuario ya está en uso.');
            }
            // --- FIN VALIDACIONES ---

            const newUser = {
                id: `user_${Date.now()}`,
                username: username,
                password: password,
                rol: rol,
                medicoId: null // El rol 'Medico' debe ser vinculado por un Admin
            };

            users.push(newUser);
            saveUsers(users);

            // --- ¡BITÁCORA! ---
            try {
                // Registra la acción usando el "username" que se acaba de crear
                // ponemos el username en localStorage temporalmente para la bitácora
                localStorage.setItem('username', username);
                window.registrarBitacora('Login', 'Registro', `Se creó la cuenta '${username}' (Rol: ${rol}).`);
                localStorage.removeItem('username'); // Lo quitamos de inmediato
            } catch (e) {
                console.warn("No se pudo registrar en bitácora (login):", e.message);
            }
            // --- Fin Bitácora ---

            registerSuccessMessage.textContent = '¡Registro exitoso! Ahora puedes iniciar sesión.';
            registerSuccessMessage.style.display = 'block';
            registerForm.reset();

            setTimeout(() => {
                showLoginView();
            }, 2000);
        
        } catch (error) {
            // Mostramos el error de validación
            registerErrorMessage.textContent = error.message;
            registerErrorMessage.style.display = 'block';
        }
    };


    // --- 6. Lógica de Login ---

    /**
     * Maneja el envío del formulario de login.
     */
    const handleLogin = (event) => {
        event.preventDefault(); // Prevenimos el envío
        const username = loginUsernameInput.value;
        const password = loginPasswordInput.value;
        loginErrorMessage.style.display = 'none';

        const users = getUsers();
        
        const foundUser = users.find(user => 
            user.username === username && 
            user.password === password
        );

        if (foundUser) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', foundUser.rol);
            localStorage.setItem('username', foundUser.username);
            localStorage.setItem('userId', foundUser.id);
            if (foundUser.rol === 'Medico' && foundUser.medicoId) {
                localStorage.setItem('medicoId', foundUser.medicoId);
            }

            // --- ¡BITÁCORA! ---
            if(window.registrarBitacora) {
                window.registrarBitacora('Login', 'Inicio de Sesión', `Usuario '${username}' accedió al sistema.`);
            }
            
            window.location.href = 'index.html';

        } else {
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

    // Mostramos la vista de Login al cargar
    showLoginView();
});