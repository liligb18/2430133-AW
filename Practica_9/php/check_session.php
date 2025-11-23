<?php
// php/check_session.php - API para verificar si hay sesión activa
require_once __DIR__ . '/security.php';

header('Content-Type: application/json');

// Verificar si hay sesión activa
if (isset($_SESSION['isAuthenticated']) && $_SESSION['isAuthenticated'] === true) {
    echo json_encode([
        'authenticated' => true,
        'username' => $_SESSION['username'] ?? '',
        'role' => $_SESSION['userRole'] ?? ''
    ]);
} else {
    echo json_encode([
        'authenticated' => false
    ]);
}
?>
