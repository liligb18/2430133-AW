<?php
// 1. Configuración de la Base de Datos
$servidor = "localhost";    
$usuario_db = "root";      
$contrasena_db = "";        
$nombre_db = "clinica_db"; 

// gestión de errores y resultados
$opciones = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Lanza excepciones en errores
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Devuelve arrays asociativos
    PDO::ATTR_EMULATE_PREPARES   => false,                  // Usa preparaciones nativas
];

try {
    // Crear la conexión PDO
    $conexion = new PDO("mysql:host=$servidor;dbname=$nombre_db;charset=utf8mb4", $usuario_db, $contrasena_db, $opciones);

} catch (PDOException $e) {
    // Si la conexión falla, detenemos todo y mostramos un error en formato JSON
    http_response_code(500); // Error interno del servidor
    echo json_encode(["error" => "Error de conexión: " . $e->getMessage()]);
    exit; // Detiene la ejecución del script
}

// Función para registrar en la bitácora
function registrarBitacora($conexion, $modulo, $accion, $detalle) {
    try {
        // Obtenemos el usuario de la sesión de PHP 
        session_start();
        $usuario = $_SESSION['username'] ?? 'Sistema';
        $idUsuario = $_SESSION['userId'] ?? null;

        $sql = "INSERT INTO BitacoraAcceso (IdUsuario, Usuario, Modulo, AccionRealizada, Detalle) VALUES (:idUsuario, :usuario, :modulo, :accion, :detalle)";
        $stmt = $conexion->prepare($sql);
        
        $stmt->bindParam(':idUsuario', $idUsuario);
        $stmt->bindParam(':usuario', $usuario);
        $stmt->bindParam(':modulo', $modulo);
        $stmt->bindParam(':accion', $accion);
        $stmt->bindParam(':detalle', $detalle);
        
        $stmt->execute();

    } catch (PDOException $e) {
        // No detenemos la app si falla la bitácora, solo lo registramos
        error_log("Error al registrar bitácora: " . $e->getMessage());
    }
}

// Ponemos el header de JSON aquí para que todos los archivos de la API lo hereden
header('Content-Type: application/json');
?>