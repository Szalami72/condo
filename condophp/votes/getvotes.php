<?php

require '../config/header.php';

class GetVotes
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function fetchVotes($questionId = null)
    {
        try {
            // Aktuális időpont
            $currentDate = date("Y-m-d H:i:s");

            // Lejárt szavazások státuszának frissítése
            $stmt = $this->conn->prepare("
                UPDATE questions 
                SET status = 
                    CASE 
                        WHEN end_date > :current_date AND status = 'closed' THEN 'open'
                        WHEN end_date <= :current_date AND status = 'open' THEN 'closed'
                        ELSE status 
                    END
            ");
            $stmt->bindParam(':current_date', $currentDate);
            $stmt->execute();

            // SQL lekérdezés: időrend szerint csökkenő sorrendben (legújabb elöl)
            if ($questionId) {
                $sql = "SELECT q.id AS question_id, q.question_text, q.created_at, q.end_date, q.status, 
                               a.id AS answer_id, a.answer_text
                        FROM questions q
                        LEFT JOIN answers a ON q.id = a.question_id
                        WHERE q.id = :questionId
                        ORDER BY q.created_at DESC";
                $stmt = $this->conn->prepare($sql);
                $stmt->bindParam(':questionId', $questionId, PDO::PARAM_INT);
            } else {
                $sql = "SELECT q.id AS question_id, q.question_text, q.created_at, q.end_date, q.status, 
                               a.id AS answer_id, a.answer_text
                        FROM questions q
                        LEFT JOIN answers a ON q.id = a.question_id
                        ORDER BY q.created_at DESC";
                $stmt = $this->conn->prepare($sql);
            }

            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Az adatokat kérdésenként csoportosítjuk
            $groupedData = [];
            foreach ($results as $row) {
                $qId = $row['question_id'];
                if (!isset($groupedData[$qId])) {
                    $groupedData[$qId] = [
                        'question_id' => $row['question_id'],
                        'question_text' => $row['question_text'],
                        'created_at' => $row['created_at'],
                        'end_date' => $row['end_date'],
                        'status' => $row['status'],
                        'answers' => []
                    ];
                }

                if ($row['answer_id']) {
                    $groupedData[$qId]['answers'][] = [
                        'answer_id' => $row['answer_id'],
                        'answer_text' => $row['answer_text']
                    ];
                }
            }

            return json_encode(['status' => 'success', 'data' => array_values($groupedData)]);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return json_encode(['status' => 'error', 'message' => 'Database error']);
        }
    }
}

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents("php://input"), true);
    $questionId = isset($input['id']) ? (int)$input['id'] : null;

    $fetcher = new GetVotes($conn);
    echo $fetcher->fetchVotes($questionId);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
