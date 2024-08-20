<?php

require '../config/header.php';

class DeleteBb
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function deleteBb($bbId)
    {
        try {
            // Ellenőrizzük, hogy a bbId érvényes szám-e
            if (is_numeric($bbId)) {
                // SQL lekérdezés a rekord törlésére
                $sql = "DELETE FROM bboards WHERE id = :id";
                
                $stmt = $this->conn->prepare($sql);
                $stmt->bindParam(':id', $bbId, PDO::PARAM_INT);
                
                $stmt->execute();

                // Ellenőrizzük, hogy sikerült-e törölni a rekordot
                if ($stmt->rowCount() > 0) {
                    return ['status' => 'success'];
                } else {
                    return ['status' => 'error', 'message' => 'No record found with the given ID'];
                }
            } else {
                return ['status' => 'error', 'message' => 'Invalid ID'];
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return ['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
}

// Példa a DeleteBb osztály használatára

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // JSON bemenet olvasása és dekódolása
    $input = json_decode(file_get_contents("php://input"), true);
    $bbId = isset($input['bbId']) ? (int)$input['bbId'] : null;

    if ($bbId !== null) {
        $deleteBb = new DeleteBb($conn);
        $result = $deleteBb->deleteBb($bbId);
        echo json_encode($result);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No ID provided']);
    }

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]);
}
