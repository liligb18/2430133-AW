<?php
// php/api/especialidades.php
require_once __DIR__ . '/common.php';
$pdo = getPDO();
try {
    requireAuth();
    $action = $_SERVER['REQUEST_METHOD'] === 'GET' ? 'list' : ($_POST['action'] ?? null);
    if ($action === 'list') {
        $stmt = $pdo->query('SELECT IdEspecialidad, NombreEspecialidad, Descripcion FROM especialidades');
        $rows = $stmt->fetchAll();
        $data = array_map(function($r){ return ['id' => (int)$r['IdEspecialidad'], 'nombre' => cleanString($r['NombreEspecialidad'],100), 'descripcion' => cleanString($r['Descripcion'],500)]; }, $rows);
        echo json_encode(['success'=>true,'data'=>$data]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Método no permitido']); exit; }
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        $nombre = cleanString($_POST['nombre'] ?? '',100);
        $descripcion = cleanString($_POST['descripcion'] ?? '',500);
        $stmt = $pdo->prepare('INSERT INTO especialidades (NombreEspecialidad, Descripcion) VALUES (:nombre, :desc)');
        $stmt->execute(['nombre'=>$nombre,'desc'=>$descripcion]);
        echo json_encode(['success'=>true,'id'=>$pdo->lastInsertId()]); exit;
    }

    if ($action === 'update') {
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT); if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        $nombre = cleanString($_POST['nombre'] ?? '',100);
        $descripcion = cleanString($_POST['descripcion'] ?? '',500);
        $stmt = $pdo->prepare('UPDATE especialidades SET NombreEspecialidad = :nombre, Descripcion = :desc WHERE IdEspecialidad = :id');
        $stmt->execute(['nombre'=>$nombre,'desc'=>$descripcion,'id'=>$id]);
        echo json_encode(['success'=>true]); exit;
    }

    if ($action === 'delete') {
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT); if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        $stmt = $pdo->prepare('DELETE FROM especialidades WHERE IdEspecialidad = :id');
        $stmt->execute(['id'=>$id]);
        echo json_encode(['success'=>true]); exit;
    }

    echo json_encode(['success'=>false,'message'=>'Acción inválida']);
} catch (Throwable $e) {
    apiErrorResponse($e);
}

?>
