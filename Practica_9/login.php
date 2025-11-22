<?php /* Página de login/registro procesada por PHP */ ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Expediente Clínico</title>
    <link rel="stylesheet" href="css/login.css">
</head>
<body>

    <div class="login-container">
        <?php
            require_once __DIR__ . '/php/security.php';
            $csrf = generate_csrf_token();
        ?>

        <form id="login-form" action="php/login.php" method="post">
            <h2>Bienvenido</h2>
            <p>Clínica UPV</p>
                <div class="input-group">
                <label for="login-username">Usuario</label>
                <input type="text" id="login-username" name="login" required maxlength="150" autocomplete="username">
            </div>
            <div class="input-group">
                <label for="login-password">Contraseña</label>
                <input type="password" id="login-password" name="password" required maxlength="128" autocomplete="current-password">
            </div>
            <button type="submit">Ingresar</button>
            <input type="hidden" name="csrf_token" value="<?php echo htmlentities($csrf); ?>">
            <p id="login-error-message" class="error-message">
                <?php if(isset($_GET['error'])){ echo htmlentities($_GET['error']); } ?>
            </p>
            <p class="toggle-link">
                ¿No tienes cuenta? <a href="#" id="show-register-link">Regístrate aquí</a>
            </p>
        </form>

        <form id="register-form" action="php/register.php" method="post">
            <h2>Crear Cuenta</h2>
            <p>Registro de nuevo personal</p>
            <div class="input-group">
                <label for="register-username">Nombre de Usuario</label>
                <input type="text" id="register-username" name="nombre" required maxlength="100" autocomplete="name">
            </div>
            <div class="input-group">
                <label for="register-email">Correo electrónico</label>
                <input type="email" id="register-email" name="correo" required maxlength="150" autocomplete="email">
            </div>
            <div class="input-group">
                <label for="register-rol">Rol de Usuario</label>
                <select id="register-rol" name="rol" required>
                    <option value="">Seleccione un rol...</option>
                    <option value="Admin">Administrador</option>
                    <option value="Medico">Médico</option>
                    <option value="Recepcionista">Recepcionista</option>
                </select>
            </div>
            <div class="input-group">
                <label for="register-password">Contraseña (mín. 6 caracteres)</label>
                <input type="password" id="register-password" name="password" required minlength="6" maxlength="128" autocomplete="new-password">
            </div>
            <div class="input-group">
                <label for="register-confirm-password">Confirmar Contraseña</label>
                <input type="password" id="register-confirm-password" name="confirm_password" required minlength="6" maxlength="128" autocomplete="new-password">
            </div>
            <button type="submit">Registrar</button>
            <input type="hidden" name="csrf_token" value="<?php echo htmlentities($csrf); ?>">
            <p id="register-error-message" class="error-message">
                <?php if(isset($_GET['reg_error'])){ echo htmlentities($_GET['reg_error']); } ?>
            </p>
            <p id="register-success-message" class="success-message">
                <?php if(isset($_GET['reg_success'])){ echo htmlentities($_GET['reg_success']); } ?>
            </p>
            <p class="toggle-link">
                ¿Ya tienes cuenta? <a href="#" id="show-login-link">Inicia sesión</a>
            </p>
        </form>
    </div>

    <script>
        // Pequeño script para alternar vistas sin dependencias externas
        document.addEventListener('DOMContentLoaded', function(){
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            const showRegisterLink = document.getElementById('show-register-link');
            const showLoginLink = document.getElementById('show-login-link');

            const showRegisterView = () => { loginForm.style.display = 'none'; registerForm.style.display = 'block'; };
            const showLoginView = () => { registerForm.style.display = 'none'; loginForm.style.display = 'block'; };

            showLoginView();

            showRegisterLink.addEventListener('click', function(e){ e.preventDefault(); showRegisterView(); });
            showLoginLink.addEventListener('click', function(e){ e.preventDefault(); showLoginView(); });
        });
    </script>
</body>
</html>
