<?php

require '../config/header.php';

class DataFetcher
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function fetchData($table)
    {
        try {
            // Ha a table értéke Squaremeters, akkor a ccForThis oszlopot is lekérdezzük
            if ($table === 'squaremeters') {
                $sql = "SELECT id, typeOf{$table}, ccostForThis, subDepForThis FROM {$table} ORDER BY typeOf{$table} ASC";
            } else {
                $sql = "SELECT id, typeOf{$table} FROM {$table} ORDER BY typeOf{$table} ASC";
            }

            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode(['status' => 'success', 'data' => $data]);
        } catch (PDOException $e) {
            return json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}


// Adatbázis kapcsolat létrehozása
try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $action = $_GET['action'] ?? null;
    if (!$action) {
        echo json_encode(['status' => 'error', 'message' => 'No action specified']);
        exit;
    }

    $validActions = ['buildings', 'floors', 'doors', 'commoncosts', 'subdeposits', 'squaremeters'];
    if (!in_array($action, $validActions)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
        exit;
    }

    $fetcher = new DataFetcher($conn);
    echo $fetcher->fetchData($action);

    $conn = null; // Kapcsolat lezárása
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()]);
}

?>
