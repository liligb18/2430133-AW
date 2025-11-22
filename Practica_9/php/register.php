<?php
// php/register.php - procesa registro POST (nombre, correo, rol, password, confirm_password)
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/security.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../login.php');
    exit;
}

$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$correo = isset($_POST['correo']) ? trim($_POST['correo']) : '';
$rol = isset($_POST['rol']) ? trim($_POST['rol']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$confirm = isset($_POST['confirm_password']) ? $_POST['confirm_password'] : '';

// Validaciones básicas
if ($nombre === '' || $correo === '' || $rol === '' || $password === '' || $confirm === '') {
    header('Location: ../login.php?reg_error=' . urlencode('Todos los campos son obligatorios.'));
    exit;
}

// Validar CSRF token
$csrf = $_POST['csrf_token'] ?? '';
if (!validate_csrf_token($csrf)) {
    header('Location: ../login.php?reg_error=' . urlencode('Token CSRF inválido.'));
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    header('Location: ../login.php?reg_error=' . urlencode('Formato de correo inválido.'));
    exit;
}

if (strlen($password) < 6) {
    header('Location: ../login.php?reg_error=' . urlencode('La contraseña debe tener al menos 6 caracteres.'));
    exit;
}

if ($password !== $confirm) {
    header('Location: ../login.php?reg_error=' . urlencode('Las contraseñas no coinciden.'));
    exit;
}

// Conexión PDO
$pdo = getPDO();

// Verificamos que no exista el correo
$stmt = $pdo->prepare('SELECT IdUsuario FROM usuarios WHERE Correo = :correo LIMIT 1');
$stmt->execute(['correo' => $correo]);
if ($stmt->fetch()) {
    header('Location: ../login.php?reg_error=' . urlencode('El correo ya está registrado.'));
    exit;
}

// Insertamos usuario usando hash de contraseña (mejora de seguridad)
$hashed = password_hash($password, PASSWORD_DEFAULT);
$insert = $pdo->prepare('INSERT INTO usuarios (Correo, Contrasena, Nombre, Rol, Activo, FechaCreacion) VALUES (:correo, :contrasena, :nombre, :rol, b\'1\', NOW())');
try {
    $insert->execute([
        'correo' => $correo,
        'contrasena' => $hashed,
        'nombre' => $nombre,
        'rol' => $rol
    ]);
} catch (Exception $e) {
    // Registrar error en log y devolver mensaje genérico al usuario
    @error_log('[' . date('Y-m-d H:i:s') . '] Registro error: ' . $e->getMessage() . "\n", 3, sys_get_temp_dir() . '/app_errors.log');
    header('Location: ../login.php?reg_error=' . urlencode('Error al crear cuenta. Intenta nuevamente más tarde.'));
    exit;
}

header('Location: ../login.php?reg_success=' . urlencode('Cuenta creada correctamente. Ya puedes iniciar sesión.'));
exit;

?>
