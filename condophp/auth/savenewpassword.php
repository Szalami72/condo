<?php 
require '../config/header.php';

class ResetPassword {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function resetPassword($token, $newPassword) {
        // Ellenőrizzük a tokent
        $sql = "SELECT userId FROM tokens WHERE token = :token";
        $stmt = $this->conn->prepare($sql);
        if ($stmt === false) {
            return ['status' => 'error', 'message' => 'Prepare failed: ' . $this->conn->errorInfo()];
        }
        $stmt->bindParam(':token', $token, PDO::PARAM_STR);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            $userId = $result['userId'];
            
            // Frissítjük a felhasználó jelszavát
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $sql = "UPDATE users SET password = :password WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            if ($stmt === false) {
                return ['status' => 'error', 'message' => 'Prepare failed: ' . $this->conn->errorInfo()];
            }
            $stmt->bindParam(':password', $hashedPassword, PDO::PARAM_STR);
            $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
            $stmt->execute();

            return ['status' => 'success', 'message' => 'Password has been reset'];
        } else {
            return ['status' => 'error', 'message' => 'Password reset not successful'];
        }
    }
}

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Jelszó visszaállítása
    $resetPassword = new ResetPassword($conn);
    $data = json_decode(file_get_contents("php://input"), true);
    $token = $data['token'];
    $newPassword = $data['newPassword'];
    $response = $resetPassword->resetPassword($token, $newPassword);
    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()]);
}
$conn = null;
?>
