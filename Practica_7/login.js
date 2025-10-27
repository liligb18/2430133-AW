document.addEventListener('DOMContentLoaded', () => {
    // Referencias a formularios y enlaces
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Referencias al Modal de Éxito
    const successModal = document.getElementById('success-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalOkButton = document.getElementById('modal-ok-button');
    const closeModalButton = document.querySelector('.close-button');

    // Función para mostrar el modal de éxito
    const showSuccessModal = (title, message, redirectUrl = null) => {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        // Muestra el modal usando la propiedad 'flex' definida en CSS
        successModal.style.display = 'flex'; 

        // Manejar la acción al hacer click en el botón "Continuar"
        modalOkButton.onclick = () => {
            successModal.style.display = 'none';
            if (redirectUrl) {
                // REDIRECCIÓN
                window.location.href = redirectUrl; 
            }
        };

        // Cerrar con el botón 'x'
        closeModalButton.onclick = () => {
            successModal.style.display = 'none';
        };

        // Cerrar al hacer click fuera del modal
        window.onclick = (event) => {
            if (event.target == successModal) {
                successModal.style.display = 'none';
            }
        };
    };

    // --- Lógica para CAMBIAR de Formulario ---
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    });

    // --- Lógica para MANEJAR ENVÍOS ---

    // Manejar el envío de INICIO DE SESIÓN
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (email && password.length >= 6) {
            console.log('Intento de Login con:', { email, password });
            
            // Simulación de éxito, REDIRECCIONA
            showSuccessModal(
                'Inicio de Sesión Exitoso',
                `Bienvenido(a) ${email}. Accediendo al menú principal.`,
                'menu-principal.html' // URL de la nueva pantalla
            );
            
            loginForm.reset();
        } else {
            // Usamos 'alert' solo para errores de validación interna
            alert('Por favor, ingresa un correo y una contraseña válida.');
        }
    });

    // Manejar el envío de REGISTRO
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert('Error: Las contraseñas no coinciden.');
            return;
        }

        if (email && password.length >= 6) {
            console.log('Intento de Registro de nuevo usuario:', { email, password });

            // Simulación de éxito. No redirige, solo vuelve al login.
            showSuccessModal(
                'Registro Exitoso',
                `Tu perfil ha sido creado con éxito. Ahora puedes iniciar sesión.`,
                null // Sin redirección
            );
            
            // Regresar a la vista de Login
            registerForm.reset();
            loginForm.classList.add('active');
            registerForm.classList.remove('active');

        } else {
            alert('El correo y la contraseña (mínimo 6 caracteres) son obligatorios.');
        }
    });

});