<?php

require '../config/header.php';

class SubmitVote
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function submitVote($data)
    {
        if (!isset($data['user_id'], $data['question_id'], $data['answer_id'])) {
            return json_encode(['status' => 'error', 'message' => 'Hiányzó adatok.']);
        }

        $userId = $data['user_id'];
        $questionId = $data['question_id'];
        $newAnswerId = $data['answer_id'];
        $updatedAt = date('Y-m-d H:i:s');

        try {
            // 1. Ellenőrizzük, hogy a felhasználó már szavazott-e erre a kérdésre
            $checkStmt = $this->conn->prepare("SELECT answer_id FROM votes WHERE user_id = :user_id AND question_id = :question_id");
            $checkStmt->execute(['user_id' => $userId, 'question_id' => $questionId]);
            $existingVote = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if ($existingVote) {
                // Ha már szavazott, frissítjük a szavazatot
                $oldAnswerId = $existingVote['answer_id'];

                if ($oldAnswerId == $newAnswerId) {
                    return json_encode(['status' => 'error', 'message' => 'Már erre a válaszra szavaztál.']);
                }

                // Frissítjük a szavazatot
                $updateStmt = $this->conn->prepare("
                    UPDATE votes 
                    SET answer_id = :new_answer_id, updated_at = :updated_at 
                    WHERE user_id = :user_id AND question_id = :question_id
                ");

                $updateStmt->execute([
                    'new_answer_id' => $newAnswerId,
                    'updated_at' => $updatedAt,
                    'user_id' => $userId,
                    'question_id' => $questionId
                ]);

                return json_encode(['status' => 'success', 'message' => 'Szavazat módosítva.']);

            } else {
                // Ha még nem szavazott, beszúrjuk az új szavazatot
                $insertStmt = $this->conn->prepare("
                    INSERT INTO votes (user_id, question_id, answer_id, created_at, updated_at) 
                    VALUES (:user_id, :question_id, :answer_id, NOW(), :updated_at)
                ");

                $insertStmt->execute([
                    'user_id' => $userId,
                    'question_id' => $questionId,
                    'answer_id' => $newAnswerId,
                    'updated_at' => $updatedAt
                ]);

                return json_encode(['status' => 'success', 'message' => 'Szavazat mentve.']);
            }

        } catch (PDOException $e) {
            return json_encode(['status' => 'error', 'message' => 'Hiba történt: ' . $e->getMessage()]);
        }
    }
}

// Kapcsolódás az adatbázishoz
try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // JSON adat beolvasása
    $input = json_decode(file_get_contents("php://input"), true);

    // Az osztály példányosítása és a szavazás mentése
    $saveVote = new SubmitVote($conn);
    echo $saveVote->submitVote($input);

} catch (PDOException $e) {
    // Hibák kezelése JSON válaszként
    echo json_encode(['status' => 'error', 'message' => 'Adatbázis kapcsolat hiba: ' . $e->getMessage()]);
}
