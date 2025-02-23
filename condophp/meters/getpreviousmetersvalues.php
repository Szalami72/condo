<?php

require '../config/header.php';

class GetPreviousMetersValues
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function fetchMeters($userId, $justLastValue = false)
    {
        $limit = $justLastValue ? 1 : 12; // Ha $justLastValue igaz, akkor csak 1 rekordot kérünk le

        $sql = "
            SELECT 
                mv.id, mv.userId, mv.mayId, mv.cold1, mv.cold2, mv.hot1, mv.hot2, mv.heating, my.monthAndYear
            FROM 
                metersvalues mv
            JOIN 
                monthandyear my ON mv.mayId = my.id
            WHERE 
                mv.userId = :userId
            ORDER BY 
                mv.id DESC
            LIMIT $limit
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['userId'])) {
        $userId = $input['userId'];
        $justLastValue = isset($input['justLastValue']) ? (bool)$input['justLastValue'] : false; // Ha nincs megadva, false lesz

        $fetcher = new GetPreviousMetersValues($conn);
        $data = $fetcher->fetchMeters($userId, $justLastValue);
        echo json_encode(['status' => 'success', 'data' => $data]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Missing user ID']);
    }

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
