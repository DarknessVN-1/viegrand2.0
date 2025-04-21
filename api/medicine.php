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

// Validate dữ liệu đầu vào
if (!$data || !isset($data['username'], $data['user_id'], $data['hour'], $data['minutes'], 
    $data['note'], $data['music'], $data['replay'], $data['status'])) {
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

// Lấy và validate dữ liệu
$username = $conn->real_escape_string($data['username']);
$user_id = (int)$data['user_id'];
$hour = (int)$data['hour'];
$minutes = (int)$data['minutes'];
$note = $conn->real_escape_string($data['note']);
$music = (int)$data['music'];
$replay = (int)$data['replay'];
$status = (int)$data['status'];

// Validate giá trị
if ($hour < 0 || $hour > 23 || $minutes < 0 || $minutes > 59) {
    echo json_encode(["success" => false, "error" => "Invalid time values"]);
    exit;
}

if ($music !== 0 && $music !== 1) {
    echo json_encode(["success" => false, "error" => "Invalid music value"]);
    exit;
}

if ($replay !== 0 && $replay !== 1) {
    echo json_encode(["success" => false, "error" => "Invalid replay value"]);
    exit;
}

if ($status !== 0 && $status !== 1) {
    echo json_encode(["success" => false, "error" => "Invalid status value"]);
    exit;
}

// Thêm dữ liệu vào database
$sql = "INSERT INTO user_medicine (username, user_id, hour, minutes, note, music, replay, status, created_at) 
        VALUES ('$username', $user_id, $hour, $minutes, '$note', $music, $replay, $status, NOW())";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Medicine added successfully"]);
} else {
    echo json_encode(["success" => false, "error" => "Error: " . $conn->error]);
}

$conn->close();
?>
