<?php
// php/api/common.php - helpers para autenticación y manejo seguro de errores
header('Content-Type: application/json; charset=utf-8');
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../security.php';

// Detectar encabezados de autenticación local (modo desarrollo):
$localAuthHeader = $_SERVER['HTTP_X_LOCAL_AUTH'] ?? null;
$localUserRole = $_SERVER['HTTP_X_USER_ROLE'] ?? null;

// Para todas las peticiones POST en endpoints API, validar token CSRF
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    // Si se proporciona autenticación local (desde localStorage) permitimos bypass de CSRF
    if ($localAuthHeader === '1') {
        // permitir si viene con X-Local-Auth
    } else {
        if (!validate_csrf_token($token)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Token CSRF inválido']);
            exit;
        }
    }
}

function requireAuth(array $roles = null) {
    // Espera que login.php haya establecido 'isAuthenticated' y 'userRole' en la sesión
    if (empty($_SESSION['isAuthenticated']) || $_SESSION['isAuthenticated'] !== true) {
        // Si no hay sesión, permitir autenticación por encabezado local (modo dev)
        $localAuth = $_SERVER['HTTP_X_LOCAL_AUTH'] ?? null;
        $localRole = $_SERVER['HTTP_X_USER_ROLE'] ?? null;
        if ($localAuth !== '1') {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit;
        }
        // establecer role temporal para validaciones posteriores
        $_SESSION['userRole'] = $localRole;
    }
    if ($roles !== null) {
        $role = $_SESSION['userRole'] ?? null;
        if (!in_array($role, $roles, true)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No tiene permisos para esta acción']);
            exit;
        }
    }
}

function apiErrorResponse(Throwable $e) {
    // Registrar error en log temporal y devolver mensaje genérico
    @error_log('[' . date('Y-m-d H:i:s') . '] API error: ' . $e->getMessage() . " in " . $e->getFile() . ':' . $e->getLine() . "\n" . $e->getTraceAsString() . "\n", 3, sys_get_temp_dir() . '/api_errors.log');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error interno en el servidor']);
    exit;
}

function cleanString($s, $max = 500) {
    $s = trim((string)$s);
    if ($max) $s = mb_substr($s, 0, $max);
    return $s;
}

?>
