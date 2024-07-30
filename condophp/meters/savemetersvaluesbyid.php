<?php

require '../config/header.php';

class SaveMetersValuesById
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function saveMeters($data)
    {
        try {
            $userId = $data['userId'];
            $monthAndYear = $data['mayId'];
            $cold1 = $data['cold1'];
            $cold2 = $data['cold2'];
            $hot1 = $data['hot1'];
            $hot2 = $data['hot2'];
            $heating = $data['heating'];

            // Ellenőrizzük, hogy van-e már bejegyzés a monthandyear táblában
            $sql = "SELECT id FROM monthandyear WHERE monthAndYear = :monthAndYear";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':monthAndYear' => $monthAndYear]);
            $mayId = $stmt->fetchColumn();

            if (!$mayId) {
                // Ha nincs, akkor hozzáadunk egy új bejegyzést a monthandyear táblához
                $sql = "INSERT INTO monthandyear (monthAndYear) VALUES (:monthAndYear)";
                $stmt = $this->conn->prepare($sql);
                $stmt->execute([':monthAndYear' => $monthAndYear]);
                $mayId = $this->conn->lastInsertId();
            }

            // Ellenőrizzük, hogy van-e már bejegyzés a metersvalues táblában a userId és mayId páros alapján
            $sql = "SELECT id FROM metersvalues WHERE userId = :userId AND mayId = :mayId";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':userId' => $userId, ':mayId' => $mayId]);
            $metersValueId = $stmt->fetchColumn();

            if ($metersValueId) {
                // Ha van, frissítsük az értékeket
                $sql = "UPDATE metersvalues SET cold1 = :cold1, cold2 = :cold2, hot1 = :hot1, hot2 = :hot2, heating = :heating WHERE id = :id";
                $stmt = $this->conn->prepare($sql);
                $stmt->execute([
                    ':cold1' => $cold1,
                    ':cold2' => $cold2,
                    ':hot1' => $hot1,
                    ':hot2' => $hot2,
                    ':heating' => $heating,
                    ':id' => $metersValueId
                ]);
            } else {
                // Ha nincs, akkor hozzáadunk egy új bejegyzést a metersvalues táblához
                $sql = "INSERT INTO metersvalues (userId, mayId, cold1, cold2, hot1, hot2, heating) VALUES (:userId, :mayId, :cold1, :cold2, :hot1, :hot2, :heating)";
                $stmt = $this->conn->prepare($sql);
                $stmt->execute([
                    ':userId' => $userId,
                    ':mayId' => $mayId,
                    ':cold1' => $cold1,
                    ':cold2' => $cold2,
                    ':hot1' => $hot1,
                    ':hot2' => $hot2,
                    ':heating' => $heating
                ]);
            }

            return ['status' => 'success'];
        } catch (PDOException $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }
}

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents("php://input"), true);

    if ($input) {
        $saver = new SaveMetersValuesById($conn);
        $result = $saver->saveMeters($input);
        echo json_encode($result);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid input data']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
