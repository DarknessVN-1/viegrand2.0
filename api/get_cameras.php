<?php
// Tạo file log
$logFile = __DIR__ . '/camera_api_log.txt';

function writeLog($message) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

writeLog("API request started");

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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

// Get user ID from request
$user_id = null;

// Check if it's POST or GET request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    writeLog("POST request received");
    $data = json_decode(file_get_contents("php://input"), true);
    $user_id = isset($data['user_id']) ? $data['user_id'] : null;
    writeLog("User ID from POST: " . ($user_id ?? 'null'));
} else {
    writeLog("GET request received");
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    writeLog("User ID from GET: " . ($user_id ?? 'null'));
}

// Log all request data for debugging
writeLog("REQUEST DATA: " . print_r($_REQUEST, true));
writeLog("GET DATA: " . print_r($_GET, true));

// Validate user_id
if ($user_id === null) {
    writeLog("Error: User ID is required");
    http_response_code(400);
    echo json_encode(array("message" => "User ID is required"));
    exit;
}

try {
    // Prepare SQL statement (using prepared statement to prevent SQL injection)
    $query = "SELECT id, user_id, camera_url, name_room, created_at FROM cameras WHERE user_id = ?";
    writeLog("Query: $query with user_id: $user_id");
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        writeLog("Error preparing statement: " . $conn->error);
        throw new Exception("Error preparing statement: " . $conn->error);
    }
    
    $stmt->bind_param("s", $user_id);
    
    // Execute query
    $execResult = $stmt->execute();
    if (!$execResult) {
        writeLog("Error executing statement: " . $stmt->error);
        throw new Exception("Error executing statement: " . $stmt->error);
    }
    
    writeLog("Query executed successfully");
    
    // Get result
    $result = $stmt->get_result();
    writeLog("Number of rows returned: " . $result->num_rows);
    
    // Fetch all rows as an associative array
    $cameras = array();
    
    while ($row = $result->fetch_assoc()) {
        writeLog("Found camera: ID=" . $row["id"] . ", name_room=" . $row["name_room"]);
        $cameras[] = array(
            "id" => $row["id"],
            "user_id" => $row["user_id"],
            "camera_url" => $row["camera_url"],
            "name_room" => $row["name_room"],
            "created_at" => $row["created_at"]
        );
    }
    
    // Return response
    if (count($cameras) > 0) {
        writeLog("Returning " . count($cameras) . " cameras");
        http_response_code(200);
        echo json_encode(array(
            "status" => "success",
            "message" => "Cameras retrieved successfully",
            "data" => $cameras
        ));
    } else {
        writeLog("No cameras found for user_id: $user_id");
        http_response_code(404);
        echo json_encode(array(
            "status" => "error",
            "message" => "No cameras found for this user"
        ));
    }
    
} catch (Exception $e) {
    writeLog("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "status" => "error",
        "message" => "Error fetching cameras: " . $e->getMessage()
    ));
}

// Close connection
$stmt->close();
$conn->close();
writeLog("Database connection closed");
writeLog("API request completed");
?>
