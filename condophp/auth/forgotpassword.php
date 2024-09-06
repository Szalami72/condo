<?php
require '../vendor/autoload.php';
require '../config/header.php';

use PHPMailer\PHPMailer\PHPMailer;
define('RESET_LINK', 'http://localhost:4200/reset-password?token=');

class CheckUserByEmail {
    private $conn;
    private $mailer;
   
    public function __construct($conn) {
        $this->conn = $conn;
        $this->mailer = new PHPMailer(true);
        $this->configureSMTP(); 
    }

    public function checkUserByEmail($email) {
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $token = $this->generateToken();
            $userId = $user['id'];
            $this->saveTokenToDatabase($userId, $token);
            $this->sendPasswordResetEmail($user['email'], $token); // Email küldés
            return ['status' => 'success', 'message' => 'Létező felhasználó!', 'email' => $user['email'], 'token' => $token];
        } else {
            return ['status' => 'error', 'message' => 'Nincs ilyen felhasználó!'];
        }
    }

    public function generateToken() {
        return bin2hex(random_bytes(16));
    }

    public function saveTokenToDatabase($userId, $token) {
        $existingToken = $this->getTokenByUserId($userId);
    
        if ($existingToken) {
            $sql = "UPDATE tokens SET token = :token, created_at = NOW() WHERE userId = :userId";
            $stmt = $this->conn->prepare($sql);
            if ($stmt === false) {
                throw new Exception('Prepare failed: ' . $this->conn->errorInfo());
            }
            $stmt->bindParam(':token', $token, PDO::PARAM_STR);
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        } else {
            $sql = "INSERT INTO tokens (userId, token, created_at) VALUES (:userId, :token, NOW())";
            $stmt = $this->conn->prepare($sql);
            if ($stmt === false) {
                throw new Exception('Prepare failed: ' . $this->conn->errorInfo());
            }
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':token', $token, PDO::PARAM_STR);
        }
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->errorInfo());
        }
    }
    

    public function getTokenByUserId($userId) {
        $sql = "SELECT token FROM tokens WHERE userId = :userId";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if ($result) {
            return $result['token'];
        } else {
            return null;
        }
    }

    private function configureSMTP() {
        $smtpConfig = require '../config/smtp_config.php'; 

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
            $resetLink = RESET_LINK . $token;

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

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $emailSender = new CheckUserByEmail($conn);
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'];
    $response = $emailSender->checkUserByEmail($email);
    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]);
}
$conn = null;
?>
