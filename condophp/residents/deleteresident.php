<?php

require '../config/header.php';

class DeleteResident {
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function deleteResident($id)
    {
        // Begin transaction
        $this->conn->beginTransaction();

        try {
            // Delete from residents table
            $sql = "DELETE FROM residents WHERE userId = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            // Delete from users table
            $sql = "DELETE FROM users WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            // Commit transaction
            $this->conn->commit();

            return true;
        } catch (Exception $e) {
            // Rollback transaction if something failed
            $this->conn->rollBack();
            throw $e;
        }
    }
}


try {
  

    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['id'])) {
        $userId = $input['id'];
        $fetcher = new DeleteResident($conn);
        $data = $fetcher->deleteResident($userId);
        echo json_encode(['status' => 'success', 'data' => $data]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Missing user ID']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
