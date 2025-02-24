<?php

require '../config/header.php';

class DeleteVote
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function fetchVote($questionId = null)
    {
       
    }
}

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents("php://input"), true);
    $questionId = isset($input['id']) ? (int)$input['id'] : null;

    $fetcher = new DeleteVote($conn);
    echo $fetcher->fetchVote($questionId);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
