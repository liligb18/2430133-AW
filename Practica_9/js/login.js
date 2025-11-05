document.addEventListener('DOMContentLoaded', () => {

    const USERS_KEY = 'usuarios_db';

    const loginForm = document.getElementById('login-form');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const loginErrorMessage = document.getElementById('login-error-message');

    const getUsers = () => {
        const usersJSON = localStorage.getItem(USERS_KEY);
        if (!usersJSON) {
            const adminDefault = [{
                id: 'user_admin',
                username: 'admin',
                password: '1234',
                rol: 'Admin'
            }];
            localStorage.setItem(USERS_KEY, JSON.stringify(adminDefault));
            return adminDefault;
        }
        return JSON.parse(usersJSON);
    };

    const handleLogin = (event) => {
        event.preventDefault(); 
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
            // (La registramos después de poner el username en localStorage)
            if(window.registrarBitacora) {
                window.registrarBitacora('Login', 'Inicio de Sesión', `Usuario '${username}' accedió al sistema.`);
            }
            // --- Fin Bitácora ---
            
            window.location.href = 'index.html';

        } else {
            loginErrorMessage.textContent = 'Usuario o contraseña incorrectos.';
            loginErrorMessage.style.display = 'block';
        }
    };

    loginForm.addEventListener('submit', handleLogin);
});