<?php
// php/login.php - procesa login POST (campo: login, password)
// DEBUG: habilitar temporalmente errores y registrar excepciones en /tmp/login_error.log
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/security.php';



try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        header('Location: ../login.php');
        exit;
    }

    $login = isset($_POST['login']) ? trim($_POST['login']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    if ($login === '' || $password === '') {
        header('Location: ../login.php?error=' . urlencode('Usuario y contraseña son requeridos.'));
        exit;
    }

    // Verificar bloqueo por intentos
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (is_login_blocked($ip)) {
        header('Location: ../login.php?error=' . urlencode('Demasiados intentos fallidos. Intenta más tarde.'));
        exit;
    }

    // Validar CSRF token
    $csrf = $_POST['csrf_token'] ?? '';
    if (!validate_csrf_token($csrf)) {
        header('Location: ../login.php?error=' . urlencode('Token CSRF inválido.'));
        exit;
    }

    $pdo = getPDO();

    // Buscamos por Correo o Nombre (campo 'Correo' o 'Nombre')
    $stmt = $pdo->prepare('SELECT * FROM usuarios WHERE Correo = :correo OR Nombre = :nombre LIMIT 1');
    $stmt->execute(['correo' => $login, 'nombre' => $login]);
    $user = $stmt->fetch();

    if (!$user) {
        record_failed_login($ip);
        header('Location: ../login.php?error=' . urlencode('Usuario o contraseña incorrectos.'));
        exit;
    }

    // Verificamos contraseña en texto plano (INSEGURO - Solo para práctica)
    $stored = isset($user['Contrasena']) ? $user['Contrasena'] : '';
    
    if ($stored === '' || $password !== $stored) {
        record_failed_login($ip);
        header('Location: ../login.php?error=' . urlencode('Usuario o contraseña incorrectos.'));
        exit;
    }

    // Inicio de sesión exitoso: regenerar id de sesión para prevenir fijación
    session_regenerate_id(true);
    $_SESSION['isAuthenticated'] = true;
    $_SESSION['userRole'] = $user['Rol'];
    $_SESSION['username'] = $user['Nombre'];
    $_SESSION['userId'] = $user['IdUsuario'];

    // Resetear contador de intentos al iniciar sesión
    reset_login_attempts($ip);

    // Actualizamos ultimo acceso
    $update = $pdo->prepare('UPDATE usuarios SET UltimoAcceso = NOW() WHERE IdUsuario = :id');
    $update->execute(['id' => $user['IdUsuario']]);

    // Redirigimos a la página principal (puedes cambiar a index.php si migras otras páginas a PHP)
    header('Location: ../index.html');
    exit;

} catch (Throwable $e) {
    // En producción, registrar en el log del servidor
    error_log('Login error: ' . $e->getMessage());
    header('Location: ../login.php?error=' . urlencode('Ocurrió un error interno. Por favor intenta más tarde.'));
    exit;
}

?>
