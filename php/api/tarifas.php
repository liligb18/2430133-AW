<?php
// php/api/tarifas.php
require_once __DIR__ . '/common.php';
$pdo = getPDO();
try {
    requireAuth();
    $action = $_SERVER['REQUEST_METHOD'] === 'GET' ? 'list' : ($_POST['action'] ?? null);
    if ($action === 'list') {
        $stmt = $pdo->query('SELECT IdTarifa, DescripcionServicio, CostoBase, EspecialidadId FROM gestortarifas');
        $rows = $stmt->fetchAll();
        $data = array_map(function($r){ return ['id'=> (int)$r['IdTarifa'], 'nombre'=>cleanString($r['DescripcionServicio'],200), 'costo'=> (float)$r['CostoBase'], 'especialidadId'=> $r['EspecialidadId'] ? (int)$r['EspecialidadId'] : null]; }, $rows);
        echo json_encode(['success'=>true,'data'=>$data]); exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Método no permitido']); exit; }
    $action = $_POST['action'] ?? '';
    if ($action === 'create') {
        // Solo Admin puede crear
        requireAuth(['Admin']);
        $nombre = cleanString($_POST['nombre'] ?? '',200);
        $costo = filter_var($_POST['costo'] ?? null, FILTER_VALIDATE_FLOAT);
        if ($costo === false) { echo json_encode(['success'=>false,'message'=>'Costo inválido']); exit; }
        if ($costo <= 0 || $costo > 100000) { echo json_encode(['success'=>false,'message'=>'Costo fuera de rango']); exit; }
        if ($nombre === '') { echo json_encode(['success'=>false,'message'=>'Nombre requerido']); exit; }
        $stmt = $pdo->prepare('INSERT INTO gestortarifas (DescripcionServicio, CostoBase) VALUES (:nombre, :costo)');
        $stmt->execute(['nombre'=>$nombre,'costo'=>$costo]);
        echo json_encode(['success'=>true,'id'=> (int)$pdo->lastInsertId()]); exit;
    }
    if ($action === 'update') {
        // Solo Admin puede actualizar
        requireAuth(['Admin']);
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT); if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        $nombre = cleanString($_POST['nombre'] ?? '',200);
        $costo = filter_var($_POST['costo'] ?? null, FILTER_VALIDATE_FLOAT);
        if ($costo === false) { echo json_encode(['success'=>false,'message'=>'Costo inválido']); exit; }
        if ($costo <= 0 || $costo > 100000) { echo json_encode(['success'=>false,'message'=>'Costo fuera de rango']); exit; }
        $stmt = $pdo->prepare('UPDATE gestortarifas SET DescripcionServicio = :nombre, CostoBase = :costo WHERE IdTarifa = :id');
        $stmt->execute(['nombre'=>$nombre,'costo'=>$costo,'id'=>$id]);
        echo json_encode(['success'=>true]); exit;
    }
    if ($action === 'delete') {
        // Solo Admin puede eliminar
        requireAuth(['Admin']);
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT); if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        $stmt = $pdo->prepare('DELETE FROM gestortarifas WHERE IdTarifa = :id');
        $stmt->execute(['id'=>$id]);
        echo json_encode(['success'=>true]); exit;
    }
    echo json_encode(['success'=>false,'message'=>'Acción inválida']);
} catch (Throwable $e) {
    apiErrorResponse($e);
}

?>
