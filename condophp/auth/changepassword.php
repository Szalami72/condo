<?php 
require '../config/header.php';

class ChangePassword {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function changePassword($data) {
        // Ellenőrizd, hogy minden szükséges adat megvan-e
        if (!isset($data['userId'], $data['oldPassword'], $data['newPassword'])) {
            return ['status' => 'error', 'message' => 'Hiányzó adatok!'];
        }

        $userId = $data['userId'];
        $oldPassword = $data['oldPassword'];
        $newPassword = $data['newPassword'];

        // Lekérjük a felhasználó jelenlegi jelszavát
        $stmt = $this->conn->prepare("SELECT password FROM users WHERE id = :id");
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['status' => 'error', 'message' => 'Felhasználó nem található!'];
        }

        // Ellenőrizzük, hogy a megadott régi jelszó egyezik-e a tárolt hash-elt jelszóval
        if (!password_verify($oldPassword, $user['password'])) {
            return ['status' => 'error', 'message' => 'Hibás régi jelszó!'];
        }

        // Titkosítjuk az új jelszót ugyanúgy, mint a generatePassword() esetében
        // (itt PASSWORD_DEFAULT opcióval)
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        // Frissítjük az adatbázisban a jelszót
        $updateStmt = $this->conn->prepare("UPDATE users SET password = :password WHERE id = :id");
        $updateStmt->execute(['password' => $hashedPassword, 'id' => $userId]);

        return ['status' => 'success', 'message' => 'Jelszó sikeresen módosítva!'];
    }
}

try {
    // Kapcsolat létrehozása az adatbázissal
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $data = json_decode(file_get_contents('php://input'), true);
    
    $changePassword = new ChangePassword($conn);
    $response = $changePassword->changePassword($data);

    echo json_encode($response);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()]);
}

$conn = null;
?>
