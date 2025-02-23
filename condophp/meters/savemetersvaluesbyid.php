<?php

require '../config/header.php';
require 'calculateCost.php';
require 'sendcalcdata.php';

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
            
            // Hónap ID lekérése vagy létrehozása
            $mayId = $this->getOrCreateMonthAndYearId($monthAndYear);

            // Értékek mentése vagy frissítése
            $this->saveOrUpdateMetersValues($userId, $mayId, $data);

            // Ellenőrzés, hogy szükséges-e számítás
            if ($this->shouldCalculateCost()) {
                $calculatedData = (new CalculateCost($this->conn))->calculate($data);
                $generatedData = (new SendCalcData($this->conn))->generate($calculatedData);
                return ['status' => 'success', 'calculatedData' => $generatedData];
            }

            return ['status' => 'success', 'message' => 'Calculation skipped due to settings'];
        } catch (PDOException $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function getOrCreateMonthAndYearId($monthAndYear)
    {
        $sql = "SELECT id FROM monthandyear WHERE monthAndYear = :monthAndYear";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':monthAndYear' => $monthAndYear]);
        $mayId = $stmt->fetchColumn();

        if (!$mayId) {
            $sql = "INSERT INTO monthandyear (monthAndYear) VALUES (:monthAndYear)";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':monthAndYear' => $monthAndYear]);
            $mayId = $this->conn->lastInsertId();
        }

        return $mayId;
    }

    private function saveOrUpdateMetersValues($userId, $mayId, $data)
    {

        $sql = "SELECT id FROM metersvalues WHERE userId = :userId AND mayId = :mayId";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':userId' => $userId, ':mayId' => $mayId]);
        $metersValueId = $stmt->fetchColumn();

        $params = [
            ':cold1' => $data['cold1'],
            ':cold2' => $data['cold2'],
            ':hot1' => $data['hot1'],
            ':hot2' => $data['hot2'],
            ':heating' => $data['heating'],
        ];

        if ($metersValueId) {
            // Frissítés
            $params[':id'] = $metersValueId;
            $sql = "UPDATE metersvalues 
                    SET cold1 = :cold1, cold2 = :cold2, hot1 = :hot1, hot2 = :hot2, heating = :heating 
                    WHERE id = :id";
        } else {
            // Új bejegyzés
            $params[':userId'] = $userId;
            $params[':mayId'] = $mayId;
            $sql = "INSERT INTO metersvalues (userId, mayId, cold1, cold2, hot1, hot2, heating) 
                    VALUES (:userId, :mayId, :cold1, :cold2, :hot1, :hot2, :heating)";
        }

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
    }

    private function shouldCalculateCost()
    {
        $sql = "SELECT value FROM settings WHERE title = 'calculateCost' LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchColumn() == 1;
    }
}

// Adatbázis kapcsolat és input kezelés
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
