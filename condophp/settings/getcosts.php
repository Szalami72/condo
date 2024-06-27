<?php

require '../config/header.php';

class GetCosts
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function fetchCosts()
    {
        $query = "SELECT title, value FROM settings";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $costs = [];
        foreach ($results as $result) {
            $costs[$result['title']] = $result['value'];
        }

        return $costs;
    }
}

try {
    $getCosts = new GetCosts($conn);
    $costs = $getCosts->fetchCosts();
    echo json_encode(['status' => 'success', 'data' => $costs]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}



?>
