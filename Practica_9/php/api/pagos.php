<?php
// php/api/pagos.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../db.php';
$pdo = getPDO();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Listar pagos existentes
        $stmt = $pdo->query('SELECT g.IdPago, g.IdCita, g.IdPaciente, g.Monto, g.MetodoPago, g.FechaPago, g.Referencia, g.EstatusPago FROM gestorpagos g');
        $rows = $stmt->fetchAll();
        echo json_encode(['success'=>true,'data'=>$rows]); exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Método no permitido']); exit; }
    $action = $_POST['action'] ?? '';
    if ($action === 'create') {
        $idCita = $_POST['idCita'] ?? null;
        $idPaciente = $_POST['idPaciente'] ?? null;
        $monto = $_POST['monto'] ?? 0;
        $metodo = $_POST['metodo'] ?? 'Efectivo';
        $referencia = $_POST['referencia'] ?? null;

        $stmt = $pdo->prepare('INSERT INTO gestorpagos (IdCita, IdPaciente, Monto, MetodoPago, Referencia, EstatusPago) VALUES (:idcita, :idpac, :monto, :metodo, :ref, :estatus)');
        $stmt->execute(['idcita'=>$idCita,'idpac'=>$idPaciente,'monto'=>$monto,'metodo'=>$metodo,'ref'=>$referencia,'estatus'=>'Pagado']);

        // opcionalmente actualizar estado de la cita
        if ($idCita) {
            $u = $pdo->prepare('UPDATE controlagenda SET EstadoCita = :estado WHERE IdCita = :id');
            $u->execute(['estado'=>'Confirmada','id'=>$idCita]);
        }

        echo json_encode(['success'=>true,'id'=>$pdo->lastInsertId()]); exit;
    }

    echo json_encode(['success'=>false,'message'=>'Acción inválida']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}

?>
