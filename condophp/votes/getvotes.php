<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require '../config/header.php';

class GetVotes
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function fetchVotes($questionId = null, $userId = null)
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

            // SQL lekérdezés szavazatok számolásával
            $sql = "
                SELECT q.id AS question_id, q.question_text, q.created_at, q.end_date, q.status, 
                       a.id AS answer_id, a.answer_text, 
                       (SELECT COUNT(*) FROM votes v WHERE v.answer_id = a.id) AS vote_count
                FROM questions q
                LEFT JOIN answers a ON q.id = a.question_id
            ";

            // Ha meg van adva kérdés ID, akkor szűrünk rá
            if ($questionId) {
                $sql .= " WHERE q.id = :questionId";
            }

            $sql .= " ORDER BY q.created_at DESC";

            $stmt = $this->conn->prepare($sql);

            // Paraméterek bindelése, ha van kérdés ID
            if ($questionId) {
                $stmt->bindParam(':questionId', $questionId, PDO::PARAM_INT);
            }

            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Adatok csoportosítása kérdésenként
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
                    // Ha van megadott userId, lekérdezzük a felhasználó szavazatát
                    $userVoteCount = 0;
                    if ($userId) {
                        $voteStmt = $this->conn->prepare("
                            SELECT COUNT(*) 
                            FROM votes v 
                            WHERE v.answer_id = :answer_id AND v.user_id = :user_id
                        ");
                        $voteStmt->bindParam(':answer_id', $row['answer_id'], PDO::PARAM_INT);
                        $voteStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                        $voteStmt->execute();
                        $userVoteCount = $voteStmt->fetchColumn();
                    }

                    $groupedData[$qId]['answers'][] = [
                        'answer_id' => $row['answer_id'],
                        'answer_text' => $row['answer_text'],
                        'vote_count' => $row['vote_count'],
                        'user_vote' => ($userVoteCount > 0) ? $userVoteCount : 0 // Ha nincs szavazat, akkor alapértelmezett nullát adunk
                    ];
                }
            }

            return json_encode(['status' => 'success', 'data' => array_values($groupedData)]);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // A bemeneti adatokat JSON-ból kódoljuk ki
    $input = json_decode(file_get_contents("php://input"), true);

    // Ha nem adunk meg id-t vagy user_id-t, azok alapértelmezett nullák lesznek
    $questionId = isset($input['id']) ? (int)$input['id'] : null;
    $userId = isset($input['user_id']) ? (int)$input['user_id'] : null;

    // A GetVotes osztály példányosítása és a fetchVotes metódus hívása
    $fetcher = new GetVotes($conn);
    echo $fetcher->fetchVotes($questionId, $userId);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
