<?php

require '../config/header.php';  

class GetFiles
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function getFiles()
    {
        try {
            $sql = "SELECT id, description, fileName, filePath, created_at FROM files ORDER BY created_at DESC";

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
    $getFiles = new GetFiles($conn);
    $files = $getFiles->getFiles();
    echo json_encode(['status' => 'success', 'data' => $files]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

?>