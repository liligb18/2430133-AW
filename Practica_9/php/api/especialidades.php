<?php
// php/api/especialidades.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../db.php';
$pdo = getPDO();

try {
    $action = $_SERVER['REQUEST_METHOD'] === 'GET' ? 'list' : ($_POST['action'] ?? null);
    if ($action === 'list') {
        $stmt = $pdo->query('SELECT IdEspecialidad, NombreEspecialidad, Descripcion FROM especialidades');
        $rows = $stmt->fetchAll();
        $data = array_map(function($r){
            return ['id'=>$r['IdEspecialidad'],'nombre'=>$r['NombreEspecialidad'],'descripcion'=>$r['Descripcion']];
        }, $rows);
        echo json_encode(['success'=>true,'data'=>$data]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Método no permitido']); exit; }
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        $nombre = $_POST['nombre'] ?? '';
        $descripcion = $_POST['descripcion'] ?? null;
        $stmt = $pdo->prepare('INSERT INTO especialidades (NombreEspecialidad, Descripcion) VALUES (:nombre, :desc)');
        $stmt->execute(['nombre'=>$nombre,'desc'=>$descripcion]);
        echo json_encode(['success'=>true,'id'=>$pdo->lastInsertId()]); exit;
    }

    if ($action === 'update') {
        $id = $_POST['id'] ?? null; if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        $nombre = $_POST['nombre'] ?? '';
        $descripcion = $_POST['descripcion'] ?? null;
        $stmt = $pdo->prepare('UPDATE especialidades SET NombreEspecialidad = :nombre, Descripcion = :desc WHERE IdEspecialidad = :id');
        $stmt->execute(['nombre'=>$nombre,'desc'=>$descripcion,'id'=>$id]);
        echo json_encode(['success'=>true]); exit;
    }

    if ($action === 'delete') {
        $id = $_POST['id'] ?? null; if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        $stmt = $pdo->prepare('DELETE FROM especialidades WHERE IdEspecialidad = :id');
        $stmt->execute(['id'=>$id]);
        echo json_encode(['success'=>true]); exit;
    }

    echo json_encode(['success'=>false,'message'=>'Acción inválida']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}

?>
