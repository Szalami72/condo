<?php

require '../config/header.php';

class SaveVote
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function saveVote($data)
    {
        try {
            // Kérdés mentése
            $sql = "INSERT INTO questions (question_text, end_date, status) VALUES (:question, :end_date, :status)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':question', $data['question']);
            $stmt->bindParam(':end_date', $data['end_date']);
            // A státusz közvetlenül itt átadva
            $status = 'open';
            $stmt->bindParam(':status', $status);
            $stmt->execute();

            // A kérdés ID-ja
            $questionId = $this->conn->lastInsertId();

            // Válaszok mentése
            $sql = "INSERT INTO answers (question_id, answer_text) VALUES (:question_id, :answer_text)";
            $stmt = $this->conn->prepare($sql);

            // A válaszok mentése, ahol minden válasz előtt a változót elmentjük
            foreach ($data['answers'] as $answer) {
                // Mentjük el a válasz szövegét egy változóba
                $answerText = $answer['answerText'];
                $stmt->bindParam(':question_id', $questionId);
                $stmt->bindParam(':answer_text', $answerText); // Most már változóként adjuk át
                $stmt->execute();
            }

            return json_encode(['status' => 'success', 'message' => 'Szavazás sikeresen mentve']);
        } catch (PDOException $e) {
            // Hibák logolása
            error_log("Database error: " . $e->getMessage());
            return json_encode(['status' => 'error', 'message' => 'Hiba történt a szavazás mentésekor: ' . $e->getMessage()]);
        }
    }
}

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // JSON adat beolvasása
    $input = json_decode(file_get_contents("php://input"), true);

    // Az osztály példányosítása és a szavazás mentése
    $saveVote = new SaveVote($conn);
    echo $saveVote->saveVote($input);

} catch (PDOException $e) {
    // Hibák kezelése JSON válaszként
    echo json_encode(['status' => 'error', 'message' => 'Adatbázis kapcsolat hiba: ' . $e->getMessage()]);
}
