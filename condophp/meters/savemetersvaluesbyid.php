<?php

require '../config/header.php';
require 'calculateCost.php';  // Az új osztály behívása

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
                // Ha nincs, új bejegyzés a monthandyear táblába
                $sql = "INSERT INTO monthandyear (monthAndYear) VALUES (:monthAndYear)";
                $stmt = $this->conn->prepare($sql);
                $stmt->execute([':monthAndYear' => $monthAndYear]);
                $mayId = $this->conn->lastInsertId();
            }

            // Ellenőrizzük, hogy van-e bejegyzés a metersvalues táblában
            $sql = "SELECT id FROM metersvalues WHERE userId = :userId AND mayId = :mayId";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':userId' => $userId, ':mayId' => $mayId]);
            $metersValueId = $stmt->fetchColumn();

            if ($metersValueId) {
                // Frissítés
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
                // Új bejegyzés
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

            // Ellenőrizzük a calculateCost értékét a settings táblában
            $sql = "SELECT value FROM settings WHERE title = 'calculateCost' LIMIT 1";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $calculateCost = $stmt->fetchColumn();

            // Csak akkor futtatjuk a CalculateCost számításokat, ha calculateCost értéke 1
            if ($calculateCost == 1) {
                // Ha a mentés sikeres volt, most hívjuk meg a CalculateCost osztályt
                $calculator = new CalculateCost($this->conn);
                $result = $calculator->calculate($data);

                // Ha a számítás is sikeres, visszatérünk a "success" státusszal
                return ['status' => 'success', 'calculatedData' => $result];
            }

            // Ha a calculateCost nem 1, akkor is visszatérünk "success" státusszal, de számítás nélkül
            return ['status' => 'success', 'message' => 'Calculation skipped due to settings'];

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
