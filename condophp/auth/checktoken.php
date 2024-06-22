<?php 
require '../config/header.php';

class ResetPassword  {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function checkToken($token) {
        $sql = "SELECT created_at FROM tokens WHERE token = ?";
        $stmt = $this->conn->prepare($sql);
        if ($stmt === false) {
            return ['status' => 'error', 'message' => 'Prepare failed: ' . $this->conn->error];
        }
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $createdAt = new DateTime($row['created_at']);
            $currentTime = new DateTime();
            $interval = $currentTime->diff($createdAt);
            $minutes = $interval->i + ($interval->days * 24 * 60) + ($interval->h * 60);

            if ($minutes > 10) {
                return ['status' => 'error', 'message' => 'Token expired'];
            } else {
                return ['status' => 'success', 'message' => 'Token is valid'];
            }
        } else {
            return ['status' => 'error', 'message' => 'Invalid token'];
        }
    }
}

// Adatbázis kapcsolat
if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

// Token ellenőrzés
$resetPassword = new ResetPassword($conn);
$data = json_decode(file_get_contents("php://input"), true);
$token = $data['token'];
$response = $resetPassword->checkToken($token);
echo json_encode($response);
$conn->close();
?>
