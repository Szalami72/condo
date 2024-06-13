<?php
require 'vendor/autoload.php';
require 'header.php';
use PHPMailer\PHPMailer\PHPMailer;

class CheckUserByEmail {
    private $conn;
    private $mailer;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->mailer = new PHPMailer(true);
        $this->configureSMTP(); 
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
            $this->sendPasswordResetEmail($user['email'], $token); // Email küldés
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

    private function configureSMTP() {
        $smtpConfig = require 'config/smtp_config.php';

        $this->mailer->isSMTP();
        $this->mailer->Host = $smtpConfig['host'];
        $this->mailer->Port = $smtpConfig['port'];
        $this->mailer->SMTPAuth = $smtpConfig['smtp_auth'];
        $this->mailer->Username = $smtpConfig['username'];
        $this->mailer->Password = $smtpConfig['password'];
        $this->mailer->SMTPSecure = $smtpConfig['smtp_secure'];
        $this->mailer->CharSet = $smtpConfig['charset'];
    }

    private function sendPasswordResetEmail($email, $token) {
        try {
            $resetLink = "http://yourwebsite.com/reset_password.php?token=" . $token;

            // Email beállítások
            $this->mailer->setFrom('admin@mycondo.hu', 'MyCondo.hu');
            $this->mailer->addAddress($email);
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Jelszó visszaállítása';
            $this->mailer->Body    = "Kattints a linkre a jelszó visszaállításához: <a href=\"" . $resetLink . "\">Jelszó visszaállítása</a>";
            $this->mailer->AltBody = "Kattints a linkre a jelszó visszaállításához: " . $resetLink;

            $this->mailer->send();
        } catch (Exception $e) {
            
            error_log("Email could not be sent. Mailer Error: {$this->mailer->ErrorInfo}");
        }
    }
}

$emailSender = new CheckUserByEmail($conn);
$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'];
$response = $emailSender->checkUserByEmail($email);
echo json_encode($response);
$conn->close();
?>
