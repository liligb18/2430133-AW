<?php
// php/api/agenda.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/common.php';
$pdo = getPDO();

try {
    // Soporta GET para listar o POST para acciones
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        requireAuth();
        $stmt = $pdo->query('SELECT ca.IdCita, ca.IdPaciente, ca.IdMedico, ca.FechaCita, ca.MotivoConsulta, ca.EstadoCita, ca.Observaciones, g.Monto as MontoPagado, g.EstatusPago FROM controlagenda ca LEFT JOIN gestorpagos g ON g.IdCita = ca.IdCita ORDER BY ca.FechaCita DESC');
        $rows = $stmt->fetchAll();
        $data = array_map(function($r){
            return [
                'id'=> (int)$r['IdCita'],
                'pacienteId'=> $r['IdPaciente'],
                'medicoId'=> $r['IdMedico'],
                'fecha'=> $r['FechaCita'],
                'motivo'=> cleanString($r['MotivoConsulta'],500),
                'estatus'=> $r['EstadoCita'],
                'observaciones'=> cleanString($r['Observaciones'],1000),
                'montoPagado'=> $r['MontoPagado'],
                'pagoEstatus'=> $r['EstatusPago']
            ];
        }, $rows);
        echo json_encode(['success'=>true,'data'=>$data]);
        exit;
    }

    // POST actions: create/update/delete
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Método no permitido']); exit; }
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        requireAuth(['Admin','Recepcionista']);
        $pacienteId = filter_var($_POST['pacienteId'] ?? null, FILTER_VALIDATE_INT);
        $medicoId = filter_var($_POST['medicoId'] ?? null, FILTER_VALIDATE_INT);
        $fecha = $_POST['fecha'] ?? '';
        $motivo = cleanString($_POST['motivo'] ?? '',500);
        $estatus = cleanString($_POST['estatus'] ?? 'Programada',50);
        if (!$pacienteId || !$medicoId || !$fecha) { echo json_encode(['success'=>false,'message'=>'Campos requeridos faltantes']); exit; }
        $dt = date_create($fecha);
        if (!$dt) { echo json_encode(['success'=>false,'message'=>'Fecha inválida']); exit; }
        // No permitir citas en el pasado
        $now = new DateTime(); if ($dt < $now) { echo json_encode(['success'=>false,'message'=>'No se pueden programar citas en el pasado']); exit; }
        
        // Verificar disponibilidad (Solapamiento de 30 mins)
        // (StartA < EndB) and (EndA > StartB)
        // New: Start=:fecha, End=:fecha+30
        // Existing: Start=FechaCita, End=FechaCita+30
        $q = $pdo->prepare('SELECT COUNT(*) as c FROM controlagenda WHERE IdMedico = :med AND EstadoCita != \'Cancelada\' AND (FechaCita < DATE_ADD(:fecha, INTERVAL 30 MINUTE) AND DATE_ADD(FechaCita, INTERVAL 30 MINUTE) > :fecha)');
        $q->execute(['med'=>$medicoId,'fecha'=>$fecha]); 
        $c = $q->fetch();
        if ($c && $c['c'] > 0) { echo json_encode(['success'=>false,'message'=>'El médico no está disponible en ese horario (conflicto con otra cita)']); exit; }
        
        $ins = $pdo->prepare('INSERT INTO controlagenda (IdPaciente, IdMedico, FechaCita, MotivoConsulta, EstadoCita, Observaciones) VALUES (:pac, :med, :fecha, :motivo, :estatus, NULL)');
        $ins->execute(['pac'=>$pacienteId,'med'=>$medicoId,'fecha'=>$fecha,'motivo'=>$motivo,'estatus'=>$estatus]);
        echo json_encode(['success'=>true,'id'=> (int)$pdo->lastInsertId()]); exit;
    }

    if ($action === 'update') {
        requireAuth(['Admin','Recepcionista']);
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT); if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        $pacienteId = filter_var($_POST['pacienteId'] ?? null, FILTER_VALIDATE_INT);
        $medicoId = filter_var($_POST['medicoId'] ?? null, FILTER_VALIDATE_INT);
        $fecha = $_POST['fecha'] ?? '';
        $motivo = cleanString($_POST['motivo'] ?? '',500);
        $estatus = cleanString($_POST['estatus'] ?? '',50);
        if (!$pacienteId || !$medicoId || !$fecha) { echo json_encode(['success'=>false,'message'=>'Campos requeridos faltantes']); exit; }
        $dt = date_create($fecha);
        if (!$dt) { echo json_encode(['success'=>false,'message'=>'Fecha inválida']); exit; }
        
        // Verificar disponibilidad (excluyendo la misma cita)
        $q = $pdo->prepare('SELECT COUNT(*) as c FROM controlagenda WHERE IdMedico = :med AND IdCita != :id AND EstadoCita != \'Cancelada\' AND (FechaCita < DATE_ADD(:fecha, INTERVAL 30 MINUTE) AND DATE_ADD(FechaCita, INTERVAL 30 MINUTE) > :fecha)');
        $q->execute(['med'=>$medicoId,'fecha'=>$fecha,'id'=>$id]); 
        $c = $q->fetch();
        if ($c && $c['c'] > 0) { echo json_encode(['success'=>false,'message'=>'El médico no está disponible en ese horario (conflicto con otra cita)']); exit; }
        
        $stmt = $pdo->prepare('UPDATE controlagenda SET IdPaciente = :pac, IdMedico = :med, FechaCita = :fecha, MotivoConsulta = :motivo, EstadoCita = :estatus WHERE IdCita = :id');
        $stmt->execute(['pac'=>$pacienteId,'med'=>$medicoId,'fecha'=>$fecha,'motivo'=>$motivo,'estatus'=>$estatus,'id'=>$id]);
        echo json_encode(['success'=>true]); exit;
    }

    if ($action === 'delete') {
        requireAuth(['Admin','Recepcionista']);
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT); if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        $stmt = $pdo->prepare('DELETE FROM controlagenda WHERE IdCita = :id');
        $stmt->execute(['id'=>$id]);
        echo json_encode(['success'=>true]); exit;
    }

    echo json_encode(['success'=>false,'message'=>'Acción inválida']);
} catch (Throwable $e) {
    apiErrorResponse($e);
}

?>
