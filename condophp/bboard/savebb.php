<?php

require '../config/header.php';

class SaveBb
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function saveOrUpdateBb($bbContent, $bbId, $isFixed)
    {
        try {
            if ($bbId === null || $bbId === 0) {
                $sql = "INSERT INTO bboards (content, created_at, isFixed) VALUES (:content, :created_at, :isFixed)";
                $currentDate = date('Y-m-d H:i:s');
                $stmt = $this->conn->prepare($sql);
                $stmt->bindParam(':content', $bbContent);
                $stmt->bindParam(':created_at', $currentDate);
                $stmt->bindParam(':isFixed', $isFixed);
            } else {
                $sql = "UPDATE bboards SET content = :content, isFixed = :isFixed, created_at = :created_at WHERE id = :id";
                $currentDate = date('Y-m-d H:i:s');
                $stmt = $this->conn->prepare($sql);
                $stmt->bindParam(':content', $bbContent);
                $stmt->bindParam(':created_at', $currentDate);
                $stmt->bindParam(':isFixed', $isFixed);
                $stmt->bindParam(':id', $bbId);
            }
            
            $stmt->execute();

            return true;
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return false;
        }
    }
}

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents("php://input"), true);
    $bbContent = isset($input['bb']) ? $input['bb'] : null;
    $bbId = isset($input['bbId']) ? (int)$input['bbId'] : null;
    $isFixed = isset($input['isFixed']) ? (int)$input['isFixed'] : null;

    if ($bbContent !== null) {
        $saveBb = new SaveBb($conn);
        $result = $saveBb->saveOrUpdateBb($bbContent, $bbId, $isFixed);
        if ($result) {
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Database operation failed']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Empty content']);
    }

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]);
}
