<?php
require '../config/header.php';

class UserAuthentication {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function authenticate($email, $password) {
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
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

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $userAuth = new UserAuthentication($conn);
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'];
    $password = $data['password'];
    $response = $userAuth->authenticate($email, $password);
    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]);
}
?>
