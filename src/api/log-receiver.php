<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['logEntry'])) {
    $logMessage = "[" . date('Y-m-d H:i:s') . "] " . $data['logEntry'] . PHP_EOL;
    // Guardar el log en un archivo en el mismo directorio
    file_put_contents('frontend_debug.log', $logMessage, FILE_APPEND);
    echo json_encode(["success" => true, "message" => "Log received."]);
} else {
    echo json_encode(["success" => false, "message" => "No log entry provided."]);
}
?>