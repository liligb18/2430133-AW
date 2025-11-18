<?php
// php/api/agenda.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../db.php';
$pdo = getPDO();

try {
    $stmt = $pdo->query('SELECT ca.IdCita, ca.IdPaciente, ca.IdMedico, ca.FechaCita, ca.MotivoConsulta, ca.EstadoCita, ca.Observaciones, g.Monto as MontoPagado, g.EstatusPago FROM controlagenda ca LEFT JOIN gestorpagos g ON g.IdCita = ca.IdCita ORDER BY ca.FechaCita DESC');
    $rows = $stmt->fetchAll();
    $data = array_map(function($r){
        return [
            'id'=>$r['IdCita'],
            'pacienteId'=>$r['IdPaciente'],
            'medicoId'=>$r['IdMedico'],
            'fecha'=>$r['FechaCita'],
            'motivo'=>$r['MotivoConsulta'],
            'estatus'=>$r['EstadoCita'],
            'observaciones'=>$r['Observaciones'],
            'montoPagado'=>$r['MontoPagado'],
            'pagoEstatus'=>$r['EstatusPago']
        ];
    }, $rows);
    echo json_encode(['success'=>true,'data'=>$data]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}

?>
