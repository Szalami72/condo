<?php 
require '../config/header.php';

class ResetPassword  {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function resetPassword($token, $newPassword) {
        // Ellenőrizzük a tokent
        $sql = "SELECT userId FROM tokens WHERE token = ?";
        $stmt = $this->conn->prepare($sql);
        if ($stmt === false) {
            return ['status' => 'error', 'message' => 'Prepare failed: ' . $this->conn->error];
        }
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $userId = $row['userId'];
            
            // Frissítjük a felhasználó jelszavát
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $sql = "UPDATE users SET password = ? WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            if ($stmt === false) {
                return ['status' => 'error', 'message' => 'Prepare failed: ' . $this->conn->error];
            }
            $stmt->bind_param("si", $hashedPassword, $userId);
            $stmt->execute();

            return ['status' => 'success', 'message' => 'Password has been reset'];
        } else {
            return ['status' => 'error', 'message' => 'Password reset not successful'];
        }
    }
}

// Jelszó visszaállítása
$resetPassword = new ResetPassword($conn);
$data = json_decode(file_get_contents("php://input"), true);
$token = $data['token'];
$newPassword = $data['newPassword'];
$response = $resetPassword->resetPassword($token, $newPassword);
echo json_encode($response);

?>
