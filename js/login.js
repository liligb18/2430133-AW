document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Obtener referencias a los elementos del DOM ---
    
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


    // --- 2. Funciones para alternar Vistas ---

    const showRegisterView = () => {
        loginForm.style.display = 'none';    // Oculta login
        registerForm.style.display = 'block'; // Muestra registro
        loginErrorMessage.style.display = 'none'; // Limpia errores
        if(registerErrorMessage) registerErrorMessage.style.display = 'none';
        if(registerSuccessMessage) registerSuccessMessage.style.display = 'none';
    };

    const showLoginView = () => {
        registerForm.style.display = 'none'; // Oculta registro
        loginForm.style.display = 'block';   // Muestra login
        if(registerErrorMessage) registerErrorMessage.style.display = 'none'; // Limpia errores
        if(registerSuccessMessage) registerSuccessMessage.style.display = 'none';
        
        // Verificar si hay errores en la URL (devueltos por PHP)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('error')) {
            loginErrorMessage.textContent = urlParams.get('error');
            loginErrorMessage.style.display = 'block';
        }
        if (urlParams.has('reg_success')) {
             // Si venimos de un registro exitoso
             if(registerSuccessMessage) {
                 registerSuccessMessage.textContent = urlParams.get('reg_success');
                 registerSuccessMessage.style.display = 'block';
             }
        }
    };


    // --- 3. Lógica de Registro (Validación Cliente) ---

    /**
     * Maneja la validación previa al envío del formulario de registro.
     */
    const handleRegisterSubmit = (event) => {
        // No prevenimos el default si todo está bien, para que se envíe al PHP
        
        // Limpiamos mensajes previos
        if(registerErrorMessage) registerErrorMessage.style.display = 'none';
        
        try {
            // --- INICIO VALIDACIONES BÁSICAS ---
            // (Las validaciones fuertes se hacen en el backend, aquí solo UX)
            if(typeof Validaciones !== 'undefined') {
                 const username = Validaciones.validarCampoTexto(registerUsernameInput.value, 'Nombre de Usuario');
                 const rol = Validaciones.validarCampoTexto(registerRolInput.value, 'Rol');
                 const password = Validaciones.validarPassword(registerPasswordInput.value, true); 
                 const confirmPassword = registerConfirmPasswordInput.value;

                 if (password !== confirmPassword) {
                     throw new Error('Las contraseñas no coinciden.');
                 }
            } else {
                // Fallback si no existe Validaciones
                if(registerPasswordInput.value !== registerConfirmPasswordInput.value) {
                    throw new Error('Las contraseñas no coinciden.');
                }
            }
            // Si pasa, dejamos que el form se envíe a php/register.php
        
        } catch (error) {
            event.preventDefault(); // Detenemos el envío
            if(registerErrorMessage) {
                registerErrorMessage.textContent = error.message;
                registerErrorMessage.style.display = 'block';
            }
        }
    };


    // --- 4. Asignación de Eventos ---

    // Validación antes de enviar registro
    if(registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);

    // Login se envía directo a php/login.php, no requiere JS interceptor salvo validaciones opcionales

    // Asignamos las funciones a los 'click' de los enlaces
    if(showRegisterLink) showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault(); 
        showRegisterView();
    });

    if(showLoginLink) showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginView();
    });

    // Mostramos la vista de Login al cargar (y chequeamos errores de URL)
    showLoginView();
});