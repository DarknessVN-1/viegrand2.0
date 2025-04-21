<?php
// Tạo file log
$logFile = __DIR__ . '/camera_api_add_log.txt';

function writeLog($message) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

writeLog("Add Camera API request started");

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    writeLog("OPTIONS request received - responding with 200 OK");
    http_response_code(200);
    exit;
}

writeLog("Headers set");

// Database connection details
$servername = "srv1412.hstgr.io";
$username = "u531045590_viegrand";
$password = "Viegrand345678@";
$dbname = "u531045590_viegrand";

writeLog("Database info prepared");

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    writeLog("Database connection failed: " . $conn->connect_error);
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed: " . $conn->connect_error));
    exit;
}

writeLog("Database connected successfully");

// Set UTF-8 character set
$conn->set_charset("utf8");

// Get the posted data
$input = file_get_contents("php://input");
writeLog("Raw input: " . $input);
$data = json_decode($input, true);
writeLog("Decoded data: " . print_r($data, true));

// Check if required fields are present
if (!isset($data['user_id']) || !isset($data['name_room'])) {
    writeLog("Error: Missing required fields");
    http_response_code(400);
    echo json_encode(array(
        "status" => "error",
        "message" => "Missing required fields (user_id, name_room)"
    ));
    exit;
}

// Extract data
$user_id = $data['user_id'];
$camera_url = isset($data['camera_url']) ? $data['camera_url'] : '';
$name_room = $data['name_room'];

writeLog("Extracted data - user_id: $user_id, camera_url: $camera_url, name_room: $name_room");

try {
    // Prepare SQL statement
    $query = "INSERT INTO cameras (user_id, camera_url, name_room, created_at) VALUES (?, ?, ?, NOW())";
    writeLog("Query: $query");
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        writeLog("Error preparing statement: " . $conn->error);
        throw new Exception("Error preparing statement: " . $conn->error);
    }
    
    $stmt->bind_param("sss", $user_id, $camera_url, $name_room);
    
    // Execute query
    $execResult = $stmt->execute();
    if (!$execResult) {
        writeLog("Error executing statement: " . $stmt->error);
        throw new Exception("Error executing statement: " . $stmt->error);
    }
    
    writeLog("Query executed successfully");
    
    // Get the ID of the inserted record
    $id = $conn->insert_id;
    writeLog("New camera ID: $id");
    
    http_response_code(201); // Created
    $response = array(
        "status" => "success",
        "message" => "Camera added successfully",
        "data" => array(
            "id" => $id,
            "user_id" => $user_id,
            "camera_url" => $camera_url,
            "name_room" => $name_room,
            "created_at" => date('Y-m-d H:i:s')
        )
    );
    writeLog("Response: " . json_encode($response));
    echo json_encode($response);
    
} catch (Exception $e) {
    writeLog("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "status" => "error",
        "message" => "Error adding camera: " . $e->getMessage()
    ));
}

// Close connection
$stmt->close();
$conn->close();
writeLog("Database connection closed");
writeLog("API request completed");
?>
