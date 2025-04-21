<?php
// Thông tin kết nối database
$servername = "localhost";
$username = "u531045590_viegrand";
$password = "Viegrand345678@";
$dbname = "u531045590_viegrand";

// Kết nối MySQL
$conn = new mysqli($servername, $username, $password, $dbname);

// Set header để trả về JSON
header('Content-Type: application/json');

// Kiểm tra kết nối
if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Connection failed: " . $conn->connect_error]));
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'], $data['hour'], $data['minutes'], $data['note'], $data['music'], $data['replay'])) {
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

$id = (int)$data['id'];
$hour = (int)$data['hour'];
$minutes = (int)$data['minutes'];
$note = $conn->real_escape_string($data['note']);
$music = (int)$data['music'];
$replay = (int)$data['replay'];

// Validate các giá trị
if ($hour < 0 || $hour > 23 || $minutes < 0 || $minutes > 59) {
    echo json_encode(["success" => false, "error" => "Invalid time values"]);
    exit;
}

$sql = "UPDATE user_medicine SET 
        hour = $hour,
        minutes = $minutes,
        note = '$note',
        music = $music,
        replay = $replay
        WHERE id = $id";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Medicine updated successfully"]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}

$conn->close();
?>
