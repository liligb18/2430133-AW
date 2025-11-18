<?php
// php/api/pacientes.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../db.php';
$pdo = getPDO();

try {
    $stmt = $pdo->query('SELECT IdPaciente, NombreCompleto FROM controlpacientes');
    $rows = $stmt->fetchAll();
    $data = array_map(function($r){ return ['id'=>$r['IdPaciente'],'nombre'=>$r['NombreCompleto']]; }, $rows);
    echo json_encode(['success'=>true,'data'=>$data]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}

?>
