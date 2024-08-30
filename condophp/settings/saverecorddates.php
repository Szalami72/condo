<?php

require '../config/header.php';

class SaveRecordDates
{
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function saveDates($startDate, $endDate, $selectedPeriod) {
        $query = "SELECT title FROM settings WHERE title IN ('startDate', 'endDate', 'selectedPeriod')";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $existingTitles = [];
        foreach ($result as $row) {
            $existingTitles[] = $row['title'];
        }

        if (in_array('startDate', $existingTitles)) {
            $updateQuery = "UPDATE settings SET value = :value WHERE title = 'startDate'";
            $stmt = $this->conn->prepare($updateQuery);
            $stmt->bindParam(':value', $startDate);
            $stmt->execute();
        } else {
            $insertQuery = "INSERT INTO settings (title, value) VALUES ('startDate', :value)";
            $stmt = $this->conn->prepare($insertQuery);
            $stmt->bindParam(':value', $startDate);
            $stmt->execute();
        }

        if (in_array('endDate', $existingTitles)) {
            $updateQuery = "UPDATE settings SET value = :value WHERE title = 'endDate'";
            $stmt = $this->conn->prepare($updateQuery);
            $stmt->bindParam(':value', $endDate);
            $stmt->execute();
        } else {
            $insertQuery = "INSERT INTO settings (title, value) VALUES ('endDate', :value)";
            $stmt = $this->conn->prepare($insertQuery);
            $stmt->bindParam(':value', $endDate);
            $stmt->execute();
        }

        if (in_array('selectedPeriod', $existingTitles)) {
            $updateQuery = "UPDATE settings SET value = :value WHERE title = 'selectedPeriod'";
            $stmt = $this->conn->prepare($updateQuery);
            $stmt->bindParam(':value', $selectedPeriod);
            $stmt->execute();
        } else {
            $insertQuery = "INSERT INTO settings (title, value) VALUES ('selectedPeriod', :value)";
            $stmt = $this->conn->prepare($insertQuery);
            $stmt->bindParam(':value', $selectedPeriod);
            $stmt->execute();
        }
    }
}

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $saveRecordDates = new SaveRecordDates($conn);
    $data = json_decode(file_get_contents("php://input"), true);

    if (json_last_error() === JSON_ERROR_NONE) {
        if (isset($data['startDay']) && isset($data['endDay']) && isset($data['selectedPeriod'])) {
            $startDate = $data['startDay'];
            $endDate = $data['endDay'];
            $selectedPeriod = $data['selectedPeriod'];
            $saveRecordDates->saveDates($startDate, $endDate, $selectedPeriod);
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'JSON decode error']);
    }
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]);
}

?>
