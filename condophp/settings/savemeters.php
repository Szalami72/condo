<?php

require '../config/header.php';

class SaveMeters
{
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function saveMeterSettings($cold1, $cold2, $hot1, $hot2, $heating) {
        // Mapping the input values to their respective titles in settings table
        $meterSettings = [
            'cold1' => $cold1,
            'cold2' => $cold2,
            'hot1' => $hot1,
            'hot2' => $hot2,
            'heating' => $heating
        ];

        // Check which settings already exist in the database
        $existingTitles = $this->getExistingTitles();

        // Iterate through meterSettings and insert or update accordingly
        foreach ($meterSettings as $title => $value) {
            if (in_array($title, $existingTitles)) {
                // Update existing record
                $this->updateSetting($title, $value);
            } else {
                // Insert new record
                $this->insertSetting($title, $value);
            }
        }
    }

    private function getExistingTitles() {
        $query = "SELECT title FROM settings WHERE title IN ('cold1', 'cold2', 'hot1', 'hot2', 'heating')";
        $result = $this->conn->query($query);

        $existingTitles = [];
        while ($row = $result->fetch_assoc()) {
            $existingTitles[] = $row['title'];
        }

        return $existingTitles;
    }

    private function updateSetting($title, $value) {
        $updateQuery = "UPDATE settings SET value = ? WHERE title = ?";
        $stmt = $this->conn->prepare($updateQuery);
        $stmt->bind_param("ss", $value, $title);
        $stmt->execute();
        $stmt->close();
    }

    private function insertSetting($title, $value) {
        $insertQuery = "INSERT INTO settings (title, value) VALUES (?, ?)";
        $stmt = $this->conn->prepare($insertQuery);
        $stmt->bind_param("ss", $title, $value);
        $stmt->execute();
        $stmt->close();
    }
}

// Usage example
$data = json_decode(file_get_contents("php://input"), true);

$cold1 = $data['cold1'];
$cold2 = $data['cold2'];
$hot1 = $data['hot1'];
$hot2 = $data['hot2'];
$heating = $data['heating'];

$saveMeters = new SaveMeters($conn);
$saveMeters->saveMeterSettings($cold1, $cold2, $hot1, $hot2, $heating);

echo json_encode(['status' => 'success']);
$conn->close();

?>
