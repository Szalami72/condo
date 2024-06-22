<?php

require '../config/header.php';

class SaveRecordDates
{
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function saveDates($startDate, $endDate) {
        $query = "SELECT title FROM settings WHERE title IN ('startDate', 'endDate')";
        $result = $this->conn->query($query);

        if (!$result) {
            die("Query failed: " . $this->conn->error);
        }

        $existingTitles = [];
        while ($row = $result->fetch_assoc()) {
            $existingTitles[] = $row['title'];
        }

        if (in_array('startDate', $existingTitles)) {
            $updateQuery = "UPDATE settings SET value = ? WHERE title = 'startDate'";
            $stmt = $this->conn->prepare($updateQuery);
            if (!$stmt) {
                die("Prepare failed: " . $this->conn->error);
            }
            $stmt->bind_param("s", $startDate);
            $stmt->execute();
            $stmt->close();
        } else {
            $insertQuery = "INSERT INTO settings (title, value) VALUES ('startDate', ?)";
            $stmt = $this->conn->prepare($insertQuery);
            if (!$stmt) {
                die("Prepare failed: " . $this->conn->error);
            }
            $stmt->bind_param("s", $startDate);
            $stmt->execute();
            $stmt->close();
        }

        if (in_array('endDate', $existingTitles)) {
            $updateQuery = "UPDATE settings SET value = ? WHERE title = 'endDate'";
            $stmt = $this->conn->prepare($updateQuery);
            if (!$stmt) {
                die("Prepare failed: " . $this->conn->error);
            }
            $stmt->bind_param("s", $endDate);
            $stmt->execute();
            $stmt->close();
        } else {
            $insertQuery = "INSERT INTO settings (title, value) VALUES ('endDate', ?)";
            $stmt = $this->conn->prepare($insertQuery);
            if (!$stmt) {
                die("Prepare failed: " . $this->conn->error);
            }
            $stmt->bind_param("s", $endDate);
            $stmt->execute();
            $stmt->close();
        }
    }
}

$saveRecordDates = new SaveRecordDates($conn);
$data = json_decode(file_get_contents("php://input"), true);

if (json_last_error() === JSON_ERROR_NONE) {
    // Check if the data contains the expected keys
    if (isset($data['startDay']) && isset($data['endDay'])) {
        $startDate = $data['startDay'];
        $endDate = $data['endDay'];
        $saveRecordDates->saveDates($startDate, $endDate);
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'JSON decode error']);
}

$conn->close();

?>
