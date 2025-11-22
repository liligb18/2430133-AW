<?php
// php/api/csrf.php - devuelve token CSRF para peticiones AJAX autenticadas
require_once __DIR__ . '/common.php';
require_once __DIR__ . '/../security.php';

try {
    // Requiere sesión autenticada
    requireAuth();
    $token = generate_csrf_token();
    echo json_encode(['success' => true, 'csrf_token' => $token]);
    exit;
} catch (Throwable $e) {
    apiErrorResponse($e);
}
