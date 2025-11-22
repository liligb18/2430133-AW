<?php
// php/api/pagos.php
require_once __DIR__ . '/common.php';
$pdo = getPDO();
try {
    requireAuth();
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Listar pagos existentes
        $stmt = $pdo->query('SELECT g.IdPago, g.IdCita, g.IdPaciente, g.Monto, g.MetodoPago, g.FechaPago, g.Referencia, g.EstatusPago FROM gestorpagos g');
        $rows = $stmt->fetchAll();
        echo json_encode(['success'=>true,'data'=>$rows]); exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Método no permitido']); exit; }
    $action = $_POST['action'] ?? '';
    if ($action === 'create') {
        $idCita = filter_var($_POST['idCita'] ?? null, FILTER_VALIDATE_INT);
        $idPaciente = filter_var($_POST['idPaciente'] ?? null, FILTER_VALIDATE_INT);
        $monto = filter_var($_POST['monto'] ?? 0, FILTER_VALIDATE_FLOAT);
        $metodo = cleanString($_POST['metodo'] ?? 'Efectivo',50);
        $referencia = cleanString($_POST['referencia'] ?? null,150);

        if ($monto === false || $monto <= 0) { echo json_encode(['success'=>false,'message'=>'Monto inválido']); exit; }

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

} catch (Throwable $e) {
    apiErrorResponse($e);
}

?>
