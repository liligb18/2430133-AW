<?php
// php/login.php - procesa login POST (campo: login, password)
// DEBUG: habilitar temporalmente errores y registrar excepciones en /tmp/login_error.log
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();
require_once __DIR__ . '/db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        header('Location: ../login.html');
        exit;
    }

    $login = isset($_POST['login']) ? trim($_POST['login']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    if ($login === '' || $password === '') {
        header('Location: ../login.html?error=' . urlencode('Usuario y contraseña son requeridos.'));
        exit;
    }

    $pdo = getPDO();

    // Buscamos por Correo o Nombre (campo 'Correo' o 'Nombre')
    $stmt = $pdo->prepare('SELECT * FROM usuarios WHERE Correo = :login OR Nombre = :login LIMIT 1');
    $stmt->execute(['login' => $login]);
    $user = $stmt->fetch();

    if (!$user) {
        header('Location: ../login.html?error=' . urlencode('Usuario o contraseña incorrectos.'));
        exit;
    }

    // Verificamos contraseña (comparación en texto plano según petición del usuario)
    if (!isset($user['Contrasena']) || $password !== $user['Contrasena']) {
        header('Location: ../login.html?error=' . urlencode('Usuario o contraseña incorrectos.'));
        exit;
    }

    // Inicio de sesión exitoso
    $_SESSION['isAuthenticated'] = true;
    $_SESSION['userRole'] = $user['Rol'];
    $_SESSION['username'] = $user['Nombre'];
    $_SESSION['userId'] = $user['IdUsuario'];

    // Actualizamos ultimo acceso
    $update = $pdo->prepare('UPDATE usuarios SET UltimoAcceso = NOW() WHERE IdUsuario = :id');
    $update->execute(['id' => $user['IdUsuario']]);

    // Redirigimos a la página principal (puedes cambiar a index.php si migras otras páginas a PHP)
    header('Location: ../index.html');
    exit;

} catch (Throwable $e) {
    // Registrar detalles del error en un log temporal para debugging
    $msg = '[' . date('Y-m-d H:i:s') . '] ' . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "\n" . $e->getTraceAsString() . "\n\n";
    @file_put_contents('/tmp/login_error.log', $msg, FILE_APPEND);
    // Devolver una página HTML5 mínima (evita Quirks Mode)
    http_response_code(500);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html>';
    echo '<html lang="es">';
    echo '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Error interno</title></head>';
    echo '<body><main style="font-family:Arial,Helvetica,sans-serif;max-width:800px;margin:2rem auto;padding:1rem;">';
    echo '<h1>Error interno</h1>';
    echo '<p>Ocurrió un error en el servidor. Los detalles fueron guardados en <code>/tmp/login_error.log</code>.</p>';
    echo '<p><a href="../login.html">Volver al formulario de inicio de sesión</a></p>';
    echo '</main></body></html>';
    exit;
}

?>
