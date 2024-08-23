<?php
require '../config/header.php';  

class GetFileById
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function getFileById($id)
    {
        try {
            $sql = "SELECT id, description, fileName, filePath FROM files WHERE id = :id LIMIT 1";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);  // Paraméter kötése
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);  // Mivel csak egy rekordot várunk, használjuk a fetch-et fetchAll helyett

            return $result;
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return false;
        }
    }
}

try {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id > 0) {
        $getFileById = new GetFileById($conn);
        $file = $getFileById->getFileById($id);
        if ($file) {
            echo json_encode(['status' => 'success', 'data' => $file]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'File not found']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid ID']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
