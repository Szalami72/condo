<?php

require '../config/header.php';

class GetLoginHistory {
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function fetchLoginHistory($userId) {
        $sql = "SELECT * FROM loginhistory WHERE userId = :userId ORDER BY loginTime DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

try {
    // Ellenőrizd, hogy a változók léteznek
    if (!isset($servername, $dbname, $username, $password)) {
        throw new Exception("Database credentials are missing.");
    }

    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    if (!empty($input['id'])) {
        $userId = (int)$input['id']; // Biztonságos típuskonverzió
        $fetcher = new GetLoginHistory($conn);
        $data = $fetcher->fetchLoginHistory($userId);
        echo json_encode(['status' => 'success', 'data' => $data]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Missing user ID']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
