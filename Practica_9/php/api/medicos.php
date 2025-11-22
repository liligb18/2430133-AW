<?php
// php/api/medicos.php
require_once __DIR__ . '/common.php';
$pdo = getPDO();
$method = $_SERVER['REQUEST_METHOD'];
$action = $method === 'GET' ? 'list' : ($_POST['action'] ?? null);

try {
    // Requerir autenticación para todas las operaciones
    requireAuth();

    if ($action === 'list') {
        $stmt = $pdo->query('SELECT cm.IdMedico, cm.NombreCompleto, cm.CedulaProfesional, cm.EspecialidadId, cm.Telefono, cm.CorreoElectronico, cm.HorarioAtencion FROM controlmedico cm');
        $medicos = [];
        while ($row = $stmt->fetch()) {
            $espName = null;
            if (!empty($row['EspecialidadId'])) {
                $s = $pdo->prepare('SELECT NombreEspecialidad FROM especialidades WHERE IdEspecialidad = :id LIMIT 1');
                $s->execute(['id' => (int)$row['EspecialidadId']]);
                $esp = $s->fetch();
                $espName = $esp ? cleanString($esp['NombreEspecialidad'],100) : null;
            }
            $horario = null;
            if (!empty($row['HorarioAtencion'])) {
                $decoded = json_decode($row['HorarioAtencion'], true);
                $horario = $decoded !== null ? $decoded : ['raw' => cleanString($row['HorarioAtencion'],1000)];
            }
            $medicos[] = [
                'id' => (int)$row['IdMedico'],
                'nombre' => cleanString($row['NombreCompleto'],150),
                'cedula' => cleanString($row['CedulaProfesional'],50),
                'especialidad' => $espName,
                'telefono' => cleanString($row['Telefono'],20),
                'email' => cleanString($row['CorreoElectronico'],150),
                'horario' => $horario
            ];
        }
        echo json_encode(['success' => true, 'data' => $medicos]);
        exit;
    }

    if ($method !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Método no permitido']); exit; }

    $action = $_POST['action'] ?? '';
    if ($action === 'create') {
        // Solo Admin puede crear médicos
        requireAuth(['Admin']);
        $nombre = cleanString($_POST['nombre'] ?? '',150);
        $cedula = cleanString($_POST['cedula'] ?? '',50);
        $especialidad = cleanString($_POST['especialidad'] ?? '',100);
        $telefono = cleanString($_POST['telefono'] ?? '',20);
        $email = cleanString($_POST['email'] ?? '',150);
        $horarioRaw = $_POST['horario'] ?? null;

        $espId = null;
        if ($especialidad !== '') {
            $s = $pdo->prepare('SELECT IdEspecialidad FROM especialidades WHERE NombreEspecialidad = :nombre LIMIT 1');
            $s->execute(['nombre' => $especialidad]);
            $r = $s->fetch();
            if ($r) $espId = (int)$r['IdEspecialidad'];
        }

        // Validar horario JSON
        $horario = null;
        if ($horarioRaw) {
            $decoded = json_decode($horarioRaw, true);
            if (is_array($decoded)) $horario = json_encode($decoded); // normalize
        }

        $stmt = $pdo->prepare('INSERT INTO controlmedico (NombreCompleto, CedulaProfesional, EspecialidadId, Telefono, CorreoElectronico, HorarioAtencion) VALUES (:nombre, :cedula, :esp, :telefono, :email, :horario)');
        $stmt->execute([
            'nombre' => $nombre,
            'cedula' => $cedula,
            'esp' => $espId,
            'telefono' => $telefono ?: null,
            'email' => $email ?: null,
            'horario' => $horario
        ]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    if ($action === 'update') {
        // Solo Admin puede actualizar médicos
        requireAuth(['Admin']);
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        $nombre = cleanString($_POST['nombre'] ?? '',150);
        $cedula = cleanString($_POST['cedula'] ?? '',50);
        $especialidad = cleanString($_POST['especialidad'] ?? '',100);
        $telefono = cleanString($_POST['telefono'] ?? '',20);
        $email = cleanString($_POST['email'] ?? '',150);
        $horarioRaw = $_POST['horario'] ?? null;

        $espId = null;
        if ($especialidad !== '') {
            $s = $pdo->prepare('SELECT IdEspecialidad FROM especialidades WHERE NombreEspecialidad = :nombre LIMIT 1');
            $s->execute(['nombre' => $especialidad]);
            $r = $s->fetch();
            if ($r) $espId = (int)$r['IdEspecialidad'];
        }

        $horario = null;
        if ($horarioRaw) {
            $decoded = json_decode($horarioRaw, true);
            if (is_array($decoded)) $horario = json_encode($decoded);
        }

        $stmt = $pdo->prepare('UPDATE controlmedico SET NombreCompleto = :nombre, CedulaProfesional = :cedula, EspecialidadId = :esp, Telefono = :telefono, CorreoElectronico = :email, HorarioAtencion = :horario WHERE IdMedico = :id');
        $stmt->execute(['nombre'=>$nombre,'cedula'=>$cedula,'esp'=>$espId,'telefono'=>$telefono ?: null,'email'=>$email ?: null,'horario'=>$horario,'id'=>$id]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'delete') {
        // Solo Admin puede eliminar médicos
        requireAuth(['Admin']);
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        $stmt = $pdo->prepare('DELETE FROM controlmedico WHERE IdMedico = :id');
        $stmt->execute(['id' => $id]);
        echo json_encode(['success' => true]);
        exit;
    }

    echo json_encode(['success' => false, 'message' => 'Acción inválida']);

} catch (Throwable $e) {
    apiErrorResponse($e);
}

?>
