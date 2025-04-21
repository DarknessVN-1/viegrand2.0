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

if (!$data || !isset($data['id'], $data['user_id'])) {
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

$id = (int)$data['id'];
$user_id = (int)$data['user_id'];

$sql = "DELETE FROM user_medicine WHERE id = $id AND user_id = $user_id";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Medicine deleted successfully"]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}

$conn->close();
?>
