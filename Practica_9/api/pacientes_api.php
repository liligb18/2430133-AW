<?php
// Incluimos el archivo de conexión
require 'conexion.php';

// Detectamos el tipo de petición
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':

        try {
            $sql = "SELECT * FROM ControlPacientes WHERE Estatus = 1";
            $stmt = $conexion->prepare($sql);
            $stmt->execute();
            $pacientes = $stmt->fetchAll();
            echo json_encode($pacientes);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al obtener pacientes: " . $e->getMessage()]);
        }
        break;

    case 'POST':
        // --- CREAR y ACTUALIZAR  ---
        
        $datos = json_decode(file_get_contents("php://input"));

        if (!isset($datos->nombre) || !isset($datos->fechaNacimiento)) {
            http_response_code(400); 
            echo json_encode(["error" => "Datos incompletos. Nombre y Fecha de Nacimiento son obligatorios."]);
            exit;
        }

        
        $conexion->beginTransaction();

        if (isset($datos->id) && !empty($datos->id)) {
            // --- ACTUALIZAR ---
            try {
                $sql = "UPDATE ControlPacientes SET 
                            NombreCompleto = :nombre, CURP = :curp, FechaNacimiento = :fechaNacimiento, Sexo = :sexo, 
                            Telefono = :telefono, CorreoElectronico = :email, Direccion = :direccion, 
                            ContactoEmergencia = :contactoEmergencia, TelefonoEmergencia = :telefonoEmergencia, 
                            Alergias = :alergias, AntecedentesMedicos = :antecedentes
                        WHERE IdPaciente = :id";
                
                $stmt = $conexion->prepare($sql);
                
                $stmt->bindParam(':id', $datos->id);
                $stmt->bindParam(':nombre', $datos->nombre);
                $stmt->bindParam(':curp', $datos->curp);
                $stmt->bindParam(':fechaNacimiento', $datos->fechaNacimiento);
                $stmt->bindParam(':sexo', $datos->sexo);
                $stmt->bindParam(':telefono', $datos->telefono);
                $stmt->bindParam(':email', $datos->email);
                $stmt->bindParam(':direccion', $datos->direccion);
                $stmt->bindParam(':contactoEmergencia', $datos->contactoEmergencia);
                $stmt->bindParam(':telefonoEmergencia', $datos->telefonoEmergencia);
                $stmt->bindParam(':alergias', $datos->alergias);
                $stmt->bindParam(':antecedentes', $datos->antecedentes);

                $stmt->execute();
                
             
                $conexion->commit();
                
                // registrarBitacora($conexion, 'Pacientes', 'Actualización', ...);
                echo json_encode(["mensaje" => "Paciente actualizado con éxito", "accion" => "Actualización"]);

            } catch (PDOException $e) {
               
                $conexion->rollBack();
                http_response_code(500);
                echo json_encode(["error" => "Error al actualizar paciente: " . $e->getMessage()]);
            }

        } else {
            // --- CREAR  ---
            try {
                $sql = "INSERT INTO ControlPacientes (
                            NombreCompleto, CURP, FechaNacimiento, Sexo, Telefono, CorreoElectronico, 
                            Direccion, ContactoEmergencia, TelefonoEmergencia, Alergias, AntecedentesMedicos
                        ) VALUES (
                            :nombre, :curp, :fechaNacimiento, :sexo, :telefono, :email, 
                            :direccion, :contactoEmergencia, :telefonoEmergencia, :alergias, :antecedentes
                        )";
                
                $stmt = $conexion->prepare($sql);
                
                $stmt->bindParam(':nombre', $datos->nombre);
                $stmt->bindParam(':curp', $datos->curp);
                $stmt->bindParam(':fechaNacimiento', $datos->fechaNacimiento);
                $stmt->bindParam(':sexo', $datos->sexo);
                $stmt->bindParam(':telefono', $datos->telefono);
                $stmt->bindParam(':email', $datos->email);
                $stmt->bindParam(':direccion', $datos->direccion);
                $stmt->bindParam(':contactoEmergencia', $datos->contactoEmergencia);
                $stmt->bindParam(':telefonoEmergencia', $datos->telefonoEmergencia);
                $stmt->bindParam(':alergias', $datos->alergias);
                $stmt->bindParam(':antecedentes', $datos->antecedentes);

                $stmt->execute();
                
                $nuevoId = $conexion->lastInsertId();
                
                
                $conexion->commit();

                // registrarBitacora($conexion, 'Pacientes', 'Creación', ...);
                echo json_encode(["mensaje" => "Paciente creado con éxito", "id" => $nuevoId, "accion" => "Creación"]);

            } catch (PDOException $e) {
                
                $conexion->rollBack();
                http_response_code(500);
                if ($e->getCode() == 23000) {
                    echo json_encode(["error" => "Error: La CURP ingresada ya existe en la base de datos."]);
                } else {
                    echo json_encode(["error" => "Error al crear paciente: " . $e->getMessage()]);
                }
            }
        }
        break;

    case 'DELETE':
      
        $conexion->beginTransaction();
        try {
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(["error" => "No se especificó un ID para borrar."]);
                exit;
            }
            $id = $_GET['id'];
            $nombre = $_GET['nombre'] ?? "ID: $id"; 

            $sql = "UPDATE ControlPacientes SET Estatus = 0 WHERE IdPaciente = :id";
            $stmt = $conexion->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
          
            $conexion->commit();
            
            // registrarBitacora($conexion, 'Pacientes', 'Eliminación', ...);
            echo json_encode(["mensaje" => "Paciente eliminado con éxito"]);

        } catch (PDOException $e) {
           
            $conexion->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar paciente: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        break;
}

// Cerramos la conexión
unset($conexion);
?>