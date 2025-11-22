<?php
// php/api/usuarios.php - CRUD usuarios (list, create, update, delete)
require_once __DIR__ . '/common.php';
$pdo = getPDO();
try {
    // Lista por GET
    requireAuth();
    $action = $_SERVER['REQUEST_METHOD'] === 'GET' ? 'list' : ($_POST['action'] ?? null);
    if ($action === 'list') {
        $stmt = $pdo->query('SELECT IdUsuario, Nombre, Correo, Rol, Activo, IdMedico FROM usuarios WHERE Activo = b\'1\'');
        $rows = $stmt->fetchAll();
        $data = array_map(function($r){ return ['id'=>(int)$r['IdUsuario'], 'nombre'=>cleanString($r['Nombre'],200), 'correo'=>cleanString($r['Correo'],150), 'rol'=>cleanString($r['Rol'],50), 'activo'=> (bool)$r['Activo'], 'medicoId' => $r['IdMedico'] ? (int)$r['IdMedico'] : null ]; }, $rows);
        echo json_encode(['success'=>true,'data'=>$data]); exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Método no permitido']); exit; }
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        requireAuth(['Admin']);
        $nombre = cleanString($_POST['username'] ?? '',200);
        $correo = cleanString($_POST['email'] ?? '',150);
        $rol = cleanString($_POST['rol'] ?? '',50);
        $password = $_POST['password'] ?? '';
        $medicoId = filter_var($_POST['medicoId'] ?? null, FILTER_VALIDATE_INT) ?: null;

        if ($nombre === '' || $correo === '' || $rol === '') { echo json_encode(['success'=>false,'message'=>'Campos requeridos faltantes']); exit; }
        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) { echo json_encode(['success'=>false,'message'=>'Correo inválido']); exit; }
        if ($password === '' || strlen($password) < 6) { echo json_encode(['success'=>false,'message'=>'Contraseña inválida (mín 6 caracteres)']); exit; }
        // Verificar correo único
        $check = $pdo->prepare('SELECT IdUsuario FROM usuarios WHERE Correo = :correo LIMIT 1');
        $check->execute(['correo'=>$correo]);
        if ($check->fetch()) { echo json_encode(['success'=>false,'message'=>'El correo ya está registrado']); exit; }
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $ins = $pdo->prepare('INSERT INTO usuarios (Correo, Contrasena, Nombre, Rol, Activo, FechaCreacion, IdMedico) VALUES (:correo, :contrasena, :nombre, :rol, b\'1\', NOW(), :medicoId)');
        $ins->execute(['correo'=>$correo,'contrasena'=>$hash,'nombre'=>$nombre,'rol'=>$rol, 'medicoId'=>$medicoId]);
        echo json_encode(['success'=>true,'id'=> (int)$pdo->lastInsertId()]); exit;
    }

    if ($action === 'update') {
        requireAuth(['Admin']);
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT); if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        $nombre = cleanString($_POST['username'] ?? '',200);
        $correo = cleanString($_POST['email'] ?? '',150);
        $rol = cleanString($_POST['rol'] ?? '',50);
        $password = $_POST['password'] ?? null;
        $medicoId = filter_var($_POST['medicoId'] ?? null, FILTER_VALIDATE_INT) ?: null;

        if ($nombre === '' || $correo === '' || $rol === '') { echo json_encode(['success'=>false,'message'=>'Campos requeridos faltantes']); exit; }
        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) { echo json_encode(['success'=>false,'message'=>'Correo inválido']); exit; }
        // Verificar correo único (excluyendo este usuario)
        $check = $pdo->prepare('SELECT IdUsuario FROM usuarios WHERE Correo = :correo AND IdUsuario != :id LIMIT 1');
        $check->execute(['correo'=>$correo,'id'=>$id]);
        if ($check->fetch()) { echo json_encode(['success'=>false,'message'=>'El correo ya está en uso por otro usuario']); exit; }
        
        if ($password !== null && $password !== '') {
            if (strlen($password) < 6) { echo json_encode(['success'=>false,'message'=>'La contraseña debe tener al menos 6 caracteres']); exit; }
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('UPDATE usuarios SET Nombre = :nombre, Correo = :correo, Rol = :rol, Contrasena = :hash, IdMedico = :medicoId WHERE IdUsuario = :id');
            $stmt->execute(['nombre'=>$nombre,'correo'=>$correo,'rol'=>$rol,'hash'=>$hash,'medicoId'=>$medicoId,'id'=>$id]);
        } else {
            $stmt = $pdo->prepare('UPDATE usuarios SET Nombre = :nombre, Correo = :correo, Rol = :rol, IdMedico = :medicoId WHERE IdUsuario = :id');
            $stmt->execute(['nombre'=>$nombre,'correo'=>$correo,'rol'=>$rol,'medicoId'=>$medicoId,'id'=>$id]);
        }
        echo json_encode(['success'=>true]); exit;
    }

    if ($action === 'delete') {
        requireAuth(['Admin']);
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT); if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        // Soft delete: marcar Activo = 0
        $stmt = $pdo->prepare('UPDATE usuarios SET Activo = b\'0\' WHERE IdUsuario = :id');
        $stmt->execute(['id'=>$id]);
        echo json_encode(['success'=>true]); exit;
    }

    echo json_encode(['success'=>false,'message'=>'Acción inválida']);
} catch (Throwable $e) {
    apiErrorResponse($e);
}

?>
