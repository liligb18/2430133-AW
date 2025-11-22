<?php
// php/api/expedientes.php - CRUD expedientes médicos (historial)
require_once __DIR__ . '/common.php';
$pdo = getPDO();

try {
    // GET: Listar expedientes
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        requireAuth();
        $pacienteId = filter_var($_GET['pacienteId'] ?? null, FILTER_VALIDATE_INT);
        
        $sql = 'SELECT IdExpediente, IdPaciente, IdMedico, FechaConsulta, Sintomas, Diagnostico, Tratamiento, RecetaMedica, NotasAdicionales FROM expedienteclinico';
        $params = [];
        
        if ($pacienteId) {
            $sql .= ' WHERE IdPaciente = :pid';
            $params['pid'] = $pacienteId;
        }
        $sql .= ' ORDER BY FechaConsulta DESC';
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        
        $data = array_map(function($r){
            return [
                'id' => (int)$r['IdExpediente'],
                'pacienteId' => (int)$r['IdPaciente'],
                'medicoId' => (int)$r['IdMedico'],
                'fecha' => $r['FechaConsulta'],
                'sintomas' => cleanString($r['Sintomas'], 2000),
                'diagnostico' => cleanString($r['Diagnostico'], 2000),
                'tratamiento' => cleanString($r['Tratamiento'], 2000),
                'receta' => cleanString($r['RecetaMedica'], 2000),
                'notas' => cleanString($r['NotasAdicionales'], 2000)
            ];
        }, $rows);
        
        echo json_encode(['success'=>true,'data'=>$data]); 
        exit;
    }

    // POST: Crear, Actualizar, Eliminar
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Método no permitido']); exit; }
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        requireAuth(['Admin','Medico']);
        $pacienteId = filter_var($_POST['pacienteId'] ?? null, FILTER_VALIDATE_INT);
        $medicoId = filter_var($_POST['medicoId'] ?? null, FILTER_VALIDATE_INT);
        $diagnostico = cleanString($_POST['diagnostico'] ?? '', 2000);
        $tratamiento = cleanString($_POST['tratamiento'] ?? '', 2000);
        $sintomas = cleanString($_POST['sintomas'] ?? '', 2000);
        $notas = cleanString($_POST['notas'] ?? '', 2000);
        $fecha = $_POST['fecha'] ?? date('Y-m-d H:i:s');

        if (!$pacienteId || !$medicoId || $diagnostico === '') { 
            echo json_encode(['success'=>false,'message'=>'Campos requeridos faltantes (Paciente, Médico, Diagnóstico)']); 
            exit; 
        }

        $ins = $pdo->prepare('INSERT INTO expedienteclinico (IdPaciente, IdMedico, FechaConsulta, Sintomas, Diagnostico, Tratamiento, NotasAdicionales) VALUES (:pid, :mid, :fecha, :sintomas, :dx, :tx, :notas)');
        $ins->execute([
            'pid' => $pacienteId,
            'mid' => $medicoId,
            'fecha' => $fecha,
            'sintomas' => $sintomas,
            'dx' => $diagnostico,
            'tx' => $tratamiento,
            'notas' => $notas
        ]);
        echo json_encode(['success'=>true,'id'=>(int)$pdo->lastInsertId()]); 
        exit;
    }

    if ($action === 'update') {
        requireAuth(['Admin','Medico']);
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT); 
        if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        
        $diagnostico = cleanString($_POST['diagnostico'] ?? '', 2000);
        $tratamiento = cleanString($_POST['tratamiento'] ?? '', 2000);
        $sintomas = cleanString($_POST['sintomas'] ?? '', 2000);
        $notas = cleanString($_POST['notas'] ?? '', 2000);

        if ($diagnostico === '') { echo json_encode(['success'=>false,'message'=>'Diagnóstico requerido']); exit; }

        $stmt = $pdo->prepare('UPDATE expedienteclinico SET Sintomas = :sintomas, Diagnostico = :dx, Tratamiento = :tx, NotasAdicionales = :notas WHERE IdExpediente = :id');
        $stmt->execute([
            'sintomas' => $sintomas,
            'dx' => $diagnostico,
            'tx' => $tratamiento,
            'notas' => $notas,
            'id' => $id
        ]);
        echo json_encode(['success'=>true]); 
        exit;
    }

    if ($action === 'delete') {
        requireAuth(['Admin']);
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT); 
        if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        
        $stmt = $pdo->prepare('DELETE FROM expedienteclinico WHERE IdExpediente = :id');
        $stmt->execute(['id'=>$id]);
        echo json_encode(['success'=>true]); 
        exit;
    }

    echo json_encode(['success'=>false,'message'=>'Acción inválida']);

} catch (Throwable $e) {
    apiErrorResponse($e);
}
?>
