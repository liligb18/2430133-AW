<?php
// php/api/medicos.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../db.php';

$pdo = getPDO();
$action = $_SERVER['REQUEST_METHOD'] === 'GET' ? 'list' : (isset($_POST['action']) ? $_POST['action'] : null);

try {
    if ($action === 'list') {
        $stmt = $pdo->query('SELECT cm.IdMedico, cm.NombreCompleto, cm.CedulaProfesional, cm.EspecialidadId, cm.Telefono, cm.CorreoElectronico, cm.HorarioAtencion FROM controlmedico cm');
        $medicos = [];
        while ($row = $stmt->fetch()) {
            // obtener nombre de especialidad
            $espName = null;
            if ($row['EspecialidadId']) {
                $s = $pdo->prepare('SELECT NombreEspecialidad FROM especialidades WHERE IdEspecialidad = :id LIMIT 1');
                $s->execute(['id' => $row['EspecialidadId']]);
                $esp = $s->fetch();
                $espName = $esp ? $esp['NombreEspecialidad'] : null;
            }
            $horario = null;
            if ($row['HorarioAtencion']) {
                $decoded = json_decode($row['HorarioAtencion'], true);
                $horario = $decoded !== null ? $decoded : ['raw' => $row['HorarioAtencion']];
            }
            $medicos[] = [
                'id' => $row['IdMedico'],
                'nombre' => $row['NombreCompleto'],
                'cedula' => $row['CedulaProfesional'],
                'especialidad' => $espName,
                'telefono' => $row['Telefono'],
                'email' => $row['CorreoElectronico'],
                'horario' => $horario
            ];
        }
        echo json_encode(['success' => true, 'data' => $medicos]);
        exit;
    }

    // Para POST actions: create, update, delete
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        exit;
    }

    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        $nombre = $_POST['nombre'] ?? '';
        $cedula = $_POST['cedula'] ?? '';
        $especialidad = $_POST['especialidad'] ?? null; // nombre de especialidad
        $telefono = $_POST['telefono'] ?? null;
        $email = $_POST['email'] ?? null;
        $horario = $_POST['horario'] ?? null; // JSON string

        // buscar id de especialidad
        $espId = null;
        if ($especialidad) {
            $s = $pdo->prepare('SELECT IdEspecialidad FROM especialidades WHERE NombreEspecialidad = :nombre LIMIT 1');
            $s->execute(['nombre' => $especialidad]);
            $r = $s->fetch();
            if ($r) $espId = $r['IdEspecialidad'];
        }

        $stmt = $pdo->prepare('INSERT INTO controlmedico (NombreCompleto, CedulaProfesional, EspecialidadId, Telefono, CorreoElectronico, HorarioAtencion) VALUES (:nombre, :cedula, :esp, :telefono, :email, :horario)');
        $stmt->execute([
            'nombre' => $nombre,
            'cedula' => $cedula,
            'esp' => $espId,
            'telefono' => $telefono,
            'email' => $email,
            'horario' => $horario ? $horario : null
        ]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    if ($action === 'update') {
        $id = $_POST['id'] ?? null;
        if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        $nombre = $_POST['nombre'] ?? '';
        $cedula = $_POST['cedula'] ?? '';
        $especialidad = $_POST['especialidad'] ?? null;
        $telefono = $_POST['telefono'] ?? null;
        $email = $_POST['email'] ?? null;
        $horario = $_POST['horario'] ?? null;

        $espId = null;
        if ($especialidad) {
            $s = $pdo->prepare('SELECT IdEspecialidad FROM especialidades WHERE NombreEspecialidad = :nombre LIMIT 1');
            $s->execute(['nombre' => $especialidad]);
            $r = $s->fetch();
            if ($r) $espId = $r['IdEspecialidad'];
        }

        $stmt = $pdo->prepare('UPDATE controlmedico SET NombreCompleto = :nombre, CedulaProfesional = :cedula, EspecialidadId = :esp, Telefono = :telefono, CorreoElectronico = :email, HorarioAtencion = :horario WHERE IdMedico = :id');
        $stmt->execute([
            'nombre'=>$nombre,'cedula'=>$cedula,'esp'=>$espId,'telefono'=>$telefono,'email'=>$email,'horario'=>$horario,'id'=>$id
        ]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'delete') {
        $id = $_POST['id'] ?? null;
        if (!$id) { echo json_encode(['success'=>false,'message'=>'ID requerido']); exit; }
        $stmt = $pdo->prepare('DELETE FROM controlmedico WHERE IdMedico = :id');
        $stmt->execute(['id' => $id]);
        echo json_encode(['success' => true]);
        exit;
    }

    echo json_encode(['success' => false, 'message' => 'Acción inválida']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

?>
