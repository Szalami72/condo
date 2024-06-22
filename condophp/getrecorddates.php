<?php

require 'header.php';

class GetRecordDates
{
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function getDates() {
        $query = "SELECT title, value FROM settings WHERE title IN ('startDate', 'endDate')";
        $result = $this->conn->query($query);

        if (!$result) {
            die("Query failed: " . $this->conn->error);
        }

        $dates = [];
        while ($row = $result->fetch_assoc()) {
            $dates[$row['title']] = $row['value'];
        }

        return $dates;
    }
}

$getRecordDates = new GetRecordDates($conn);
$dates = $getRecordDates->getDates();
echo json_encode(['status' => 'success', 'data' => $dates]);

$conn->close();

?>
