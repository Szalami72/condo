<?php
require '../config/header.php';

class UpdateDatasByUser
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function updateDatas($data)
    {
        $userId = $data['id'];
        $type = $data['type'];
        $value = $data['value'];

        $sql = "UPDATE users SET $type = :value WHERE id = :userId";
        $stmt = $this->conn->prepare($sql);

        // Paraméterek bindelése
        $stmt->bindParam(':value', $value);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);

        // Végrehajtás
        if ($stmt->execute()) {
            return 'Sikeres frissítés';
        } else {
            return 'Hiba történt a frissítés során';
        }  
    }
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    $updateDatas = new UpdateDatasByUser($conn);
    $response = $updateDatas->updateDatas($data); 

 
    echo json_encode(['status' => 'success', 'data' => $response]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
