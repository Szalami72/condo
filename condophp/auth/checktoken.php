<?php 
require '../config/header.php';

class ResetPassword {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function checkToken($token) {
        $sql = "SELECT created_at FROM tokens WHERE token = :token";
        $stmt = $this->conn->prepare($sql);
        if ($stmt === false) {
            return ['status' => 'error', 'message' => 'Prepare failed: ' . $this->conn->errorInfo()];
        }
        $stmt->bindParam(':token', $token, PDO::PARAM_STR);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            $createdAt = new DateTime($result['created_at']);
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

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Token ellenőrzés
    $resetPassword = new ResetPassword($conn);
    $data = json_decode(file_get_contents("php://input"), true);
    $token = $data['token'];
    $response = $resetPassword->checkToken($token);
    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()]);
}
$conn = null;
?>
