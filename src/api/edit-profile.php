<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include("../functions.php"); // Asumiendo que functions.php está en el directorio padre

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;
$fullName = $data['fullName'] ?? null;
$email = $data['email'] ?? null;
$phone = $data['phone'] ?? null;
$skills = $data['skills'] ?? null;
$experience = $data['experience'] ?? null;

if (!$id || !$email) {
    echo json_encode([
        "success" => false,
        "message" => "El ID y el correo electrónico son requeridos."
    ]);
    exit;
}

try {
    $conexion = conectarDB();
    if (!$conexion) {
        throw new Exception("Error de conexión a la base de datos");
    }

    // El campo 'username' en la BD se usa para 'fullName'
    $query = "UPDATE registro_usuarios SET username = ?, email = ?, telefono = ?, habilidades = ?, experiencia = ? WHERE id = ?";
    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    
    $stmt->bind_param("sssssi", $fullName, $email, $phone, $skills, $experience, $id);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Perfil actualizado correctamente."
        ]);
    } else {
        throw new Exception("No se pudo actualizar el perfil del usuario: " . $stmt->error);
    }

    $stmt->close();
    $conexion->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
}
?>
