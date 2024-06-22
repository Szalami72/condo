<?php

require '../config/header.php';

class GetMeters
{
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function getMeters() {
        $query = "SELECT title, value FROM settings WHERE title IN ('cold1', 'cold2', 'hot1', 'hot2', 'heating')";
        $result = $this->conn->query($query);

        if (!$result) {
            die("Query failed: " . $this->conn->error);
        }

        $meters = [
            'cold1' => false,
            'cold2' => false,
            'hot1' => false,
            'hot2' => false,
            'heating' => false
        ];

        while ($row = $result->fetch_assoc()) {
            $meters[$row['title']] = $row['value'];
        }

        return $meters;
    }
}

$getMeters = new GetMeters($conn);
$meters = $getMeters->getMeters();
echo json_encode(['status' => 'success', 'data' => $meters]);

$conn->close();

?>
