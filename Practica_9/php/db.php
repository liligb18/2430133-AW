<?php
// db.php - conexión PDO a la base de datos
function getPDO() {
    $host = 'localhost';
        // Nombre correcto de la base de datos (ajustado):
        $db   = 'clinicaupv';
    $user = 'medicalupv';
    $pass = 'GUBL060801MTSTLLA';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        // Para producción, no muestres detalles sensibles. Aquí imprimimos para desarrollo local.
        http_response_code(500);
        echo 'Error de conexión a la base de datos: ' . htmlspecialchars($e->getMessage());
        exit;
    }
}

?>
