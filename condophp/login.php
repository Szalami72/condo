<?php
require 'header.php';

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'];
$password = $data['password'];

$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password'])) {
        echo json_encode(['status' => 'success', 'message' => 'Sikeres bejelentkezés!', 'user' => $user]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Érvénytelen jelszó!']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Nincs ilyen felhasználó!']);
}

$conn->close();
?>
