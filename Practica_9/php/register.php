<?php
// php/register.php - procesa registro POST (nombre, correo, rol, password, confirm_password)
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../login.html');
    exit;
}

$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$correo = isset($_POST['correo']) ? trim($_POST['correo']) : '';
$rol = isset($_POST['rol']) ? trim($_POST['rol']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$confirm = isset($_POST['confirm_password']) ? $_POST['confirm_password'] : '';

// Validaciones básicas
if ($nombre === '' || $correo === '' || $rol === '' || $password === '' || $confirm === '') {
    header('Location: ../login.html?reg_error=' . urlencode('Todos los campos son obligatorios.'));
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    header('Location: ../login.html?reg_error=' . urlencode('Formato de correo inválido.'));
    exit;
}

if (strlen($password) < 6) {
    header('Location: ../login.html?reg_error=' . urlencode('La contraseña debe tener al menos 6 caracteres.'));
    exit;
}

if ($password !== $confirm) {
    header('Location: ../login.html?reg_error=' . urlencode('Las contraseñas no coinciden.'));
    exit;
}

$pdo = getPDO();

// Verificamos que no exista el correo
$stmt = $pdo->prepare('SELECT IdUsuario FROM usuarios WHERE Correo = :correo LIMIT 1');
$stmt->execute(['correo' => $correo]);
if ($stmt->fetch()) {
    header('Location: ../login.html?reg_error=' . urlencode('El correo ya está registrado.'));
    exit;
}

// Insertamos usuario
// NOTA: según la petición, almacenamos la contraseña en texto plano (INSEGURO).
$insert = $pdo->prepare('INSERT INTO usuarios (Correo, Contrasena, Nombre, Rol, Activo, FechaCreacion) VALUES (:correo, :contrasena, :nombre, :rol, b\'1\', NOW())');
try {
    $insert->execute([
        'correo' => $correo,
        'contrasena' => $password, // texto plano (NO RECOMENDADO)
        'nombre' => $nombre,
        'rol' => $rol
    ]);
} catch (Exception $e) {
    header('Location: ../login.html?reg_error=' . urlencode('Error al crear cuenta: ' . $e->getMessage()));
    exit;
}

header('Location: ../login.html?reg_success=' . urlencode('Cuenta creada correctamente. Ya puedes iniciar sesión.'));
exit;

?>
