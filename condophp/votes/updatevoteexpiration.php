<?php
require '../config/header.php';

class UpdateVoteExpiration
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function fetchVoteExpiration($questionId, $newEndDate)
    {
        try {
            $sql = "UPDATE questions SET end_date = :end_date WHERE id = :questionId";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':end_date', $newEndDate);
            $stmt->bindParam(':questionId', $questionId, PDO::PARAM_INT);
            $stmt->execute();
    
            return json_encode(['status' => 'success', 'message' => 'Lejárati idő frissítve']);
        } catch (PDOException $e) {
            return json_encode(['status' => 'error', 'message' => 'Adatbázis hiba']);
        }
            
    }
}

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents("php://input"), true);
    $questionId = isset($input['question_id']) ? (int)$input['question_id'] : null;
    $newEndDate = isset($input['new_end_date']) ? $input['new_end_date'] : null;

    if ($questionId) {
        $deleter = new UpdateVoteExpiration($conn);
        echo $deleter->fetchVoteExpiration($questionId, $newEndDate);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Nincs megadva kérdés azonosító']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
