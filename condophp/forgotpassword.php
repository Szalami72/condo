<?php
require 'header.php';

class CheckUserByEmail {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function checkUserByEmail($email) {
        $sql = "SELECT * FROM users WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $token = $this->generateToken();
            $userId = $user['id'];
            $this->saveTokenToDatabase($userId, $token);
            return ['status' => 'success', 'message' => 'Létező felhasználó!', 'email' => $user['email'], 'token' => $token];
        } else {
            return ['status' => 'error', 'message' => 'Nincs ilyen felhasználó!'];
        }
    }

    public function generateToken(){
        $token = bin2hex(random_bytes(16));
        return $token;
    }

    public function saveTokenToDatabase($userId, $token) {
        $existingToken = $this->getTokenByUserId($userId);
    
        if ($existingToken) {
            $sql = "UPDATE tokens SET token = ? WHERE userId = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("si", $token, $userId);
            $stmt->execute();
        } else {
            $sql = "INSERT INTO tokens (userId, token) VALUES (?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("is", $userId, $token);
            $stmt->execute();
        }
    }
    
    public function getTokenByUserId($userId) {
        $sql = "SELECT token FROM tokens WHERE userId = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return $row['token'];
        } else {
            return null;
        }
    }
    
    
}


$userAuth = new CheckUserByEmail($conn);
$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'];
$response = $userAuth->checkUserByEmail($email);
echo json_encode($response);

$conn->close();
?>
