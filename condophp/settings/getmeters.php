<?php

require '../config/header.php';

class GetMeters
{
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function getMeters() {
        $metersToFetch = ['cold1', 'cold2', 'hot1', 'hot2', 'heating'];

        $query = "SELECT title, value FROM settings WHERE title IN ('cold1', 'cold2', 'hot1', 'hot2', 'heating')";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

$meters = [
    'cold1' => false,
    'cold2' => false,
    'hot1' => false,
    'hot2' => false,
    'heating' => false
];

if (!$result) {
    echo json_encode(['status' => 'success', 'data' => $meters]);
    exit; 
}

foreach ($result as $row) {
    $meters[$row['title']] = $row['value'];
}

        

        // Update existing meters with values from database
        foreach ($result as $row) {
            $meters[$row['title']] = $row['value'];
        }

        return $meters;
    }
}

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $getMeters = new GetMeters($conn);
    $meters = $getMeters->getMeters();
    echo json_encode(['status' => 'success', 'data' => $meters]);
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]);
}
?>
