<?php
// php/api/tarifas.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../db.php';
$pdo = getPDO();

try {
    $action = $_SERVER['REQUEST_METHOD'] === 'GET' ? 'list' : ($_POST['action'] ?? null);
    if ($action === 'list') {
        $stmt = $pdo->query('SELECT IdTarifa, DescripcionServicio, CostoBase, EspecialidadId FROM gestortarifas');
        $rows = $stmt->fetchAll();
        $data = array_map(function($r){
            return ['id'=>$r['IdTarifa'],'nombre'=>$r['DescripcionServicio'],'costo'=>$r['CostoBase'],'especialidadId'=>$r['EspecialidadId']];
        }, $rows);
        echo json_encode(['success'=>true,'data'=>$data]); exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Método no permitido']); exit; }
    $action = $_POST['action'] ?? '';
    if ($action === 'create') {
        $nombre = $_POST['nombre'] ?? '';
        $costo = $_POST['costo'] ?? 0;
        $stmt = $pdo->prepare('INSERT INTO gestortarifas (DescripcionServicio, CostoBase) VALUES (:nombre, :costo)');
        $stmt->execute(['nombre'=>$nombre,'costo'=>$costo]);
        echo json_encode(['success'=>true,'id'=>$pdo->lastInsertId()]); exit;
    }
    if ($action === 'update') {
        $id = $_POST['id'] ?? null; if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        $nombre = $_POST['nombre'] ?? '';
        $costo = $_POST['costo'] ?? 0;
        $stmt = $pdo->prepare('UPDATE gestortarifas SET DescripcionServicio = :nombre, CostoBase = :costo WHERE IdTarifa = :id');
        $stmt->execute(['nombre'=>$nombre,'costo'=>$costo,'id'=>$id]);
        echo json_encode(['success'=>true]); exit;
    }
    if ($action === 'delete') {
        $id = $_POST['id'] ?? null; if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        $stmt = $pdo->prepare('DELETE FROM gestortarifas WHERE IdTarifa = :id');
        $stmt->execute(['id'=>$id]);
        echo json_encode(['success'=>true]); exit;
    }
    echo json_encode(['success'=>false,'message'=>'Acción inválida']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}

?>
