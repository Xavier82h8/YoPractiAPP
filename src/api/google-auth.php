<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include("../functions.php");

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'] ?? null;
$fullName = $data['fullName'] ?? null;
$googleId = $data['googleId'] ?? null;

if (!$email || !$googleId) {
    echo json_encode(["success" => false, "message" => "Faltan el email o el ID de Google."]);
    exit;
}

try {
    $conexion = conectarDB();
    if (!$conexion) {
        throw new Exception("Error de conexión a la base de datos.");
    }

    // 1. Buscar si el usuario ya existe por google_id o email
    $query = "SELECT * FROM registro_usuarios WHERE google_id = ? OR email = ?";
    $stmt = $conexion->prepare($query);
    if (!$stmt) { throw new Exception("Error al preparar la consulta de búsqueda."); }
    $stmt->bind_param("ss", $googleId, $email);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $usuario = $resultado->fetch_assoc();
    $stmt->close();

    if ($usuario) {
        // --- Usuario ya existe ---
        $userId = $usuario['id'];
        
        // Si el usuario existe pero no tiene google_id, o no está verificado, lo actualizamos.
        if (empty($usuario['google_id']) || $usuario['verificado'] != 1) {
            $updateQuery = "UPDATE registro_usuarios SET google_id = ?, verificado = 1 WHERE id = ?";
            $updateStmt = $conexion->prepare($updateQuery);
            if (!$updateStmt) { throw new Exception("Error al preparar la consulta de actualización."); }
            $updateStmt->bind_param("si", $googleId, $userId);
            $updateStmt->execute();
            $updateStmt->close();
        }

        $response = [
            "success" => true,
            "message" => "Usuario autenticado correctamente.",
            "usuario" => [
                "id" => $userId,
                "email" => $usuario['email'],
                "fullName" => $usuario['nombre_usuario'] ?: $usuario['nombre_empresa'],
                "tipo_usuario" => $usuario['tipo_usuario']
            ]
        ];
        echo json_encode($response);

    } else {
        // --- Usuario no existe, hay que crearlo ---
        $tipoUsuario = 'alumno'; // Por defecto para registros con Google
        $passwordHash = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT); // Contraseña aleatoria segura
        $defaultPhone = '000000000'; // Valor predeterminado para el campo NOT NULL
        $defaultCountryCode = 'NA'; // Valor predeterminado para el campo NOT NULL

        $insertQuery = "INSERT INTO registro_usuarios (nombre_usuario, email, password, tipo_usuario, verificado, google_id, fecha_registro, telefono, codigo_pais) VALUES (?, ?, ?, ?, 1, ?, NOW(), ?, ?)";
        $insertStmt = $conexion->prepare($insertQuery);
        if (!$insertStmt) { throw new Exception("Error al preparar la consulta de inserción: " . $conexion->error); }
        $insertStmt->bind_param("sssssss", $fullName, $email, $passwordHash, $tipoUsuario, $googleId, $defaultPhone, $defaultCountryCode);
        
        if ($insertStmt->execute()) {
            $newUserId = $insertStmt->insert_id;
            $response = [
                "success" => true,
                "message" => "Usuario registrado y verificado con Google exitosamente.",
                "usuario" => [
                    "id" => $newUserId,
                    "email" => $email,
                    "fullName" => $fullName,
                    "tipo_usuario" => $tipoUsuario
                ]
            ];
            echo json_encode($response);
        } else {
            throw new Exception("No se pudo crear el nuevo usuario: " . $insertStmt->error);
        }
        $insertStmt->close();
    }

    $conexion->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
}
?>
