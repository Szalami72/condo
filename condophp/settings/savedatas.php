<?php

require '../config/header.php';

class SaveDatas
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function saveDatas($datas)
    {
        foreach ($datas as $data) {
            if (isset($data['id']) && $data['id'] > 0) {

                $query = "UPDATE condodatas SET title = :title, data = :data, isEditable = :isEditable WHERE id = :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':title', $data['title']);
                $stmt->bindParam(':data', $data['data']);
                $stmt->bindParam(':isEditable', $data['isEditable'], PDO::PARAM_BOOL);
                $stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);
                $stmt->execute();
            } else {

                if (!empty($data['title']) || !empty($data['data'])) {
                    $query = "INSERT INTO condodatas (title, data, isEditable) VALUES (:title, :data, :isEditable)";
                    $stmt = $this->conn->prepare($query);
                    $stmt->bindParam(':title', $data['title']);
                    $stmt->bindParam(':data', $data['data']);
                    $stmt->bindParam(':isEditable', $data['isEditable'], PDO::PARAM_BOOL);
                    $stmt->execute();
                }
            }

            if (empty($data['title']) && empty($data['data'])) {
                $query = "DELETE FROM condodatas WHERE id = :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);
                $stmt->execute();
            }
        }

        return ['status' => 'success'];
    }
}

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $data = json_decode(file_get_contents('php://input'), true);
    $saveDatas = new SaveDatas($conn);
    $response = $saveDatas->saveDatas($data);
    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]);
}
?>
