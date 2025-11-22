<?php
// php/login.php - procesa login POST (campo: login, password)
// DEBUG: habilitar temporalmente errores y registrar excepciones en /tmp/login_error.log
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/security.php';

// Asegurar cookies de sesión (httponly, secure si HTTPS, SameSite=Lax)
session_set_cookie_params([
    'httponly' => true,
    'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    'samesite' => 'Lax'
]);
session_start();

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
    $stmt = $pdo->prepare('SELECT * FROM usuarios WHERE Correo = :login OR Nombre = :login LIMIT 1');
    $stmt->execute(['login' => $login]);
    $user = $stmt->fetch();

    if (!$user) {
        record_failed_login($ip);
        header('Location: ../login.php?error=' . urlencode('Usuario o contraseña incorrectos.'));
        exit;
    }

    // Verificamos contraseña. Soportamos dos casos:
    // 1) contraseña hasheada => usar password_verify
    // 2) contraseña legacy en texto plano => permitir el login y migrar a hash
    $stored = isset($user['Contrasena']) ? $user['Contrasena'] : '';
    $passwordOk = false;
    if ($stored !== '' && password_verify($password, $stored)) {
        $passwordOk = true;
        // Re-hash si es necesario
        if (password_needs_rehash($stored, PASSWORD_DEFAULT)) {
            $newHash = password_hash($password, PASSWORD_DEFAULT);
            $reh = $pdo->prepare('UPDATE usuarios SET Contrasena = :hash WHERE IdUsuario = :id');
            $reh->execute(['hash' => $newHash, 'id' => $user['IdUsuario']]);
        }
    } elseif ($stored !== '' && $password === $stored) {
        // Legacy plaintext match: migrar a hash
        $passwordOk = true;
        $newHash = password_hash($password, PASSWORD_DEFAULT);
        $reh = $pdo->prepare('UPDATE usuarios SET Contrasena = :hash WHERE IdUsuario = :id');
        $reh->execute(['hash' => $newHash, 'id' => $user['IdUsuario']]);
    }

    if (!$passwordOk) {
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
    // Registrar detalles del error en un log temporal para debugging (ubicación en sistema)
    $msg = '[' . date('Y-m-d H:i:s') . '] ' . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "\n" . $e->getTraceAsString() . "\n\n";
    @file_put_contents(sys_get_temp_dir() . '/login_error.log', $msg, FILE_APPEND);
    // Devolver una página HTML5 mínima (evita Quirks Mode)
    http_response_code(500);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html>';
    echo '<html lang="es">';
    echo '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Error interno</title></head>';
    echo '<body><main style="font-family:Arial,Helvetica,sans-serif;max-width:800px;margin:2rem auto;padding:1rem;">';
    echo '<h1>Error interno</h1>';
    echo '<p>Ocurrió un error en el servidor. Los detalles fueron guardados en <code>/tmp/login_error.log</code>.</p>';
    echo '<p><a href="../login.php">Volver al formulario de inicio de sesión</a></p>';
    echo '</main></body></html>';
    exit;
}

?>
