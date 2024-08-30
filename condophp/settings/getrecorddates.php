<?php

require '../config/header.php';

class GetRecordDates
{
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function getDates() {
        $query = "SELECT title, value FROM settings WHERE title IN ('startDate', 'endDate', 'selectedPeriod')";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$result) {
            die("Query failed");
        }

        $dates = [
            'startDate' => null,
            'endDate' => null,
            'selectedPeriod' => null
        ];

        foreach ($result as $row) {
            $dates[$row['title']] = $row['value'];
        }

        return $dates;
    }
}

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $getRecordDates = new GetRecordDates($conn);
    $dates = $getRecordDates->getDates();
    echo json_encode(['status' => 'success', 'data' => $dates]);
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]);
}
?>
