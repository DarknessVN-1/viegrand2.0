<?php
// Thông tin kết nối database
$servername = "localhost";
$username = "u531045590_viegrand";
$password = "Viegrand345678@";
$dbname = "u531045590_viegrand";

// Kết nối MySQL
$conn = new mysqli($servername, $username, $password, $dbname);

// Kiểm tra kết nối
if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Connection failed: " . $conn->connect_error]));
}

// Nhận dữ liệu JSON từ POST request
$data = json_decode(file_get_contents("php://input"), true);

// Kiểm tra dữ liệu đầu vào
if (!$data || !isset($data['username'], $data['user_id'])) {
    echo json_encode(["success" => false, "error" => "Invalid data"]);
    exit;
}

$username = $conn->real_escape_string($data['username']);
$user_id = (int)$data['user_id'];

// Query lấy danh sách thuốc
$sql = "SELECT * FROM user_medicine WHERE username = '$username' AND user_id = $user_id ORDER BY hour ASC, minutes ASC";
$result = $conn->query($sql);

if ($result) {
    $medicines = array();
    while ($row = $result->fetch_assoc()) {
        $medicines[] = $row;
    }
    echo json_encode(["success" => true, "data" => $medicines]);
} else {
    echo json_encode(["success" => false, "error" => "Query error: " . $conn->error]);
}

$conn->close();
?>
