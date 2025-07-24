<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include("../functions.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;

if (!$id) {
    echo json_encode([
        "success" => false,
        "message" => "El ID de usuario es requerido."
    ]);
    exit;
}

$allowedFields = [
    'email' => 'email',
    'phone' => 'telefono',
    'fullName' => 'nombre_usuario',
    'companyName' => 'nombre_empresa',
    'skills' => 'habilidades',
    'website' => 'website',
    'companyDescription' => 'descripcion_empresa',
    'category' => 'categoria',
    'foundedYear' => 'ano_fundacion',
    'companySize' => 'tamano_empresa',
    'location' => 'ubicacion',
    'address' => 'direccion'
];

$fieldsToUpdate = [];
$params = [];
$types = '';

if (isset($data['companyName']) && !isset($data['fullName'])) {
    $data['fullName'] = $data['companyName'];
}

foreach ($allowedFields as $jsonKey => $dbColumn) {
    if (isset($data[$jsonKey])) {
        if ($data[$jsonKey] !== '' && $data[$jsonKey] !== null) {
            $fieldsToUpdate[] = "{$dbColumn} = ?";
            $params[] = $data[$jsonKey];
            $types .= 's';
        }
    }
}

if (empty($fieldsToUpdate)) {
    echo json_encode([
        "success" => true,
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
    $types .= 'i';
    $params[] = $id;

    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    
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