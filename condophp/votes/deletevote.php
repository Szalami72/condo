<?php
require '../config/header.php';

class DeleteVote
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function deleteVote($questionId)
    {
        try {
            // Először töröljük a válaszokat
            $stmt = $this->conn->prepare("DELETE FROM answers WHERE question_id = :questionId");
            $stmt->bindParam(':questionId', $questionId, PDO::PARAM_INT);
            $stmt->execute();

            // Majd töröljük a kérdést
            $stmt = $this->conn->prepare("DELETE FROM questions WHERE id = :questionId");
            $stmt->bindParam(':questionId', $questionId, PDO::PARAM_INT);
            $stmt->execute();

            return json_encode(['status' => 'success', 'message' => 'Szavazás törölve']);
        } catch (PDOException $e) {
            return json_encode(['status' => 'error', 'message' => 'Hiba történt a törlés során']);
        }
    }
}

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents("php://input"), true);
    $questionId = isset($input['question_id']) ? (int)$input['question_id'] : null;

    if ($questionId) {
        $deleter = new DeleteVote($conn);
        echo $deleter->deleteVote($questionId);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Nincs megadva kérdés azonosító']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
