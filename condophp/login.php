<?php
require 'header.php';

class UserAuthentication {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function authenticate($email, $password) {
        $sql = "SELECT * FROM users WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();

            if (password_verify($password, $user['password'])) {
                return ['status' => 'success', 'message' => 'Sikeres bejelentkezés!', 'user' => $user];
            } else {
                return ['status' => 'error', 'message' => 'Érvénytelen jelszó!'];
            }
        } else {
            return ['status' => 'error', 'message' => 'Nincs ilyen felhasználó!'];
        }
    }
}

$userAuth = new UserAuthentication($conn);
$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'];
$password = $data['password'];
$response = $userAuth->authenticate($email, $password);
echo json_encode($response);

$conn->close();
?>
