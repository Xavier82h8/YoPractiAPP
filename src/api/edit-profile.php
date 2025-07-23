<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include("../functions.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;

// El ID es el único campo estrictamente requerido
if (!$id) {
    echo json_encode([
        "success" => false,
        "message" => "El ID de usuario es requerido."
    ]);
    exit;
}

// Mapeo de campos del frontend a columnas de la BD 'registro_usuarios'
$allowedFields = [
    'email' => 'email',
    'phone' => 'telefono',
    'fullName' => 'nombre_usuario', // Para alumnos
    'companyName' => 'nombre_empresa', // Para empresas
    'skills' => 'habilidades'
];

$fieldsToUpdate = [];
$params = [];
$types = '';

// Si se envía 'companyName', también actualizamos 'nombre_usuario' para consistencia.
if (isset($data['companyName']) && !isset($data['fullName'])) {
    $data['fullName'] = $data['companyName'];
}


foreach ($allowedFields as $jsonKey => $dbColumn) {
    if (isset($data[$jsonKey])) {
        // Asegurarse de que el campo no esté vacío si se envía
        if($data[$jsonKey] !== '' && $data[$jsonKey] !== null) {
            $fieldsToUpdate[] = "{$dbColumn} = ?";
            $params[] = $data[$jsonKey];
            $types .= 's'; // 's' for string
        }
    }
}

if (empty($fieldsToUpdate)) {
    echo json_encode([
        "success" => true, // No es un error, simplemente no había nada que cambiar
        "message" => "No se proporcionaron campos para actualizar."
    ]);
    exit;
}

try {
    $conexion = conectarDB();
    if (!$conexion) {
        throw new Exception("Error de conexión a la base de datos");
    }

    $query = "UPDATE registro_usuarios SET " . implode(', ', $fieldsToUpdate) . " WHERE id = ?";
    $types .= 'i'; // 'i' for integer (user ID)
    $params[] = $id;

    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    
    // bind_param necesita referencias, así que creamos un array de ellas
    $stmt->bind_param($types, ...$params);

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
