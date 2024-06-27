<?php

require '../config/header.php';

class GetDatas
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function initializeData()
    {
        // Check if there are any rows in the table
        $query = "SELECT COUNT(*) as count FROM condodatas";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        // If there are no rows, insert default data
        if ($result['count'] == 0) {
            $insertQuery = "INSERT INTO condodatas (title, data, isEditable) VALUES
                ('A társasház neve:', '', false),
                ('A társasház email címe:', '', false)";
            $stmt = $this->conn->prepare($insertQuery);
            $stmt->execute();
        }

        // Fetch all rows to return to the frontend
        $fetchQuery = "SELECT * FROM condodatas";
        $stmt = $this->conn->prepare($fetchQuery);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $data;
    }
}

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $getDatas = new GetDatas($conn);
    $data = $getDatas->initializeData();
    echo json_encode(['status' => 'success', 'data' => $data]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]);
}

?>
