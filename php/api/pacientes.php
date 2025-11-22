<?php
// php/api/pacientes.php
require_once __DIR__ . '/common.php';
$pdo = getPDO();
try {
    // Requerir autenticación (cualquier rol autenticado puede listar pacientes)
    requireAuth();

    $stmt = $pdo->query('SELECT IdPaciente, NombreCompleto FROM controlpacientes');
    $rows = $stmt->fetchAll();
    $data = array_map(function($r){ return ['id'=> (int)$r['IdPaciente'],'nombre'=>cleanString($r['NombreCompleto'],150)]; }, $rows);
    echo json_encode(['success'=>true,'data'=>$data]);
} catch (Throwable $e) {
    apiErrorResponse($e);
}

?>
