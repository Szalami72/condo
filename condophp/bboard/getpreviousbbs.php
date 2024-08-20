<?php

require '../config/header.php';

class GetBboards
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function fetchBoards() {
        try {
            $sql = "SELECT id, content, created_at FROM bboards ORDER BY created_at DESC";

            $stmt = $this->conn->prepare($sql);
            
            $stmt->execute();
            
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $result;
        } catch (PDOException $e) {

            error_log("Database error: " . $e->getMessage());
            return false;
        }
    }

}

try {
    $getCosts = new GetBboards($conn);
    $costs = $getCosts->fetchBoards();
    echo json_encode(['status' => 'success', 'data' => $costs]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

?>