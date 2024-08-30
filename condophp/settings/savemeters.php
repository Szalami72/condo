<?php

require '../config/header.php';

class SaveMeters
{
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function saveMeterSettings($cold1, $cold2, $hot1, $hot2, $heating) {
        $meterSettings = [
            'cold1' => $cold1,
            'cold2' => $cold2,
            'hot1' => $hot1,
            'hot2' => $hot2,
            'heating' => $heating
            
        ];

        $existingTitles = $this->getExistingTitles();

        foreach ($meterSettings as $title => $value) {
            if (in_array($title, $existingTitles)) {
                $this->updateSetting($title, $value);
            } else {
                $this->insertSetting($title, $value);
            }
        }
    }

    private function getExistingTitles() {
        $query = "SELECT title FROM settings WHERE title IN ('cold1', 'cold2', 'hot1', 'hot2', 'heating')";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $existingTitles = [];
        foreach ($result as $row) {
            $existingTitles[] = $row['title'];
        }

        return $existingTitles;
    }

    private function updateSetting($title, $value) {
        $updateQuery = "UPDATE settings SET value = :value WHERE title = :title";
        $stmt = $this->conn->prepare($updateQuery);
        $stmt->bindParam(':value', $value);
        $stmt->bindParam(':title', $title);
        $stmt->execute();
    }

    private function insertSetting($title, $value) {
        $insertQuery = "INSERT INTO settings (title, value) VALUES (:title, :value)";
        $stmt = $this->conn->prepare($insertQuery);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':value', $value);
        $stmt->execute();
    }
}

$data = json_decode(file_get_contents("php://input"), true);

$cold1 = $data['cold1'];
$cold2 = $data['cold2'];
$hot1 = $data['hot1'];
$hot2 = $data['hot2'];
$heating = $data['heating'];

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $saveMeters = new SaveMeters($conn);
    $saveMeters->saveMeterSettings($cold1, $cold2, $hot1, $hot2, $heating);

    echo json_encode(['status' => 'success']);
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]);
}
?>
