<?php
require '../config/header.php';

class SaveResidenceData
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function saveData($data)
    {
        // Felhasználó jelszavának hashelése
        $newPassword = '12345678'; // Állandó jelszó
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        // Felhasználó létrehozása a users táblában
        $sql = "INSERT INTO users (username, email, phone, adminLevel, password) 
                VALUES (:username, :email, :phone, :adminLevel, :password)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':username', $data['name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':phone', $data['phone']);
        $stmt->bindParam(':adminLevel', $data['adminLevel']);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->execute();
        
        // Felhasználó id-jének lekérdezése
        $userId = $this->conn->lastInsertId();

        // Épület adatok ellenőrzése és mentése
        $buildingId = $this->saveOrUpdate('buildings', 'typeOfBuildings', $data['building']);

        // Emelet adatok ellenőrzése és mentése
        $floorId = $this->saveOrUpdate('floors', 'typeOfFloors', $data['floor']);

        // Ajtó adatok ellenőrzése és mentése
        $doorId = $this->saveOrUpdate('doors', 'typeOfDoors', $data['door']);

        // Négyzetméter adatok ellenőrzése és mentése
        $squareMeterId = $this->saveOrUpdate('squaremeters', 'typeOfSquareMeters', $data['squareMeter']);

        // Közös költség adatok ellenőrzése és mentése
        $commonCostId = $this->saveOrUpdate('commoncosts', 'typeOfCommoncosts', $data['commoncost']);

        // Balance tábla frissítése
        $sql = "INSERT INTO balance (userId, value) VALUES (:userId, :balance)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':userId', $userId);
        $stmt->bindParam(':balance', $data['balance']);
        $stmt->execute();

        // Meters serial number tábla frissítése
        $this->saveMeterSerialNumbers($userId, $data);

        // Residences tábla frissítése
        $sql = "INSERT INTO residences (userId, buildingId, floorId, doorId, squareMeterId, isMeters, commonCost) 
                VALUES (:userId, :buildingId, :floorId, :doorId, :squareMeterId, :isMeters, :commonCost)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':userId', $userId);
        $stmt->bindParam(':buildingId', $buildingId);
        $stmt->bindParam(':floorId', $floorId);
        $stmt->bindParam(':doorId', $doorId);
        $stmt->bindParam(':squareMeterId', $squareMeterId);
        $stmt->bindParam(':isMeters', $data['isMeter']);
        $stmt->bindParam(':commonCost', $commonCostId);
        $stmt->execute();
    }

    private function saveOrUpdate($table, $columnName, $value)
    {
        // Ellenőrizzük, hogy van-e már ilyen érték a táblában
        $sql = "SELECT id FROM $table WHERE $columnName = :value";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':value', $value);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            return $result['id']; // Ha már van ilyen érték, visszaadjuk az id-t
        } else {
            // Ha nincs, beszúrjuk az új értéket és visszaadjuk az újonnan generált id-t
            $sql = "INSERT INTO $table ($columnName) VALUES (:value)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':value', $value);
            $stmt->execute();
            return $this->conn->lastInsertId();
        }
    }

    private function saveMeterSerialNumbers($userId, $data)
    {
        // Megjegyezzük a létrejött id-t és a megfelelő meterId-t
        $meterSerials = [
            ['field' => 'cold1', 'serial' => 'cold1SerialNumber', 'typeOfMeter' => 'cold1'],
            ['field' => 'hot1', 'serial' => 'hot1SerialNumber', 'typeOfMeter' => 'hot1'],
            ['field' => 'cold2', 'serial' => 'cold2SerialNumber', 'typeOfMeter' => 'cold2'],
            ['field' => 'hot2', 'serial' => 'hot2SerialNumber', 'typeOfMeter' => 'hot2'],
            // Egyéb meterId-ket itt adhatsz hozzá
        ];

        foreach ($meterSerials as $meter) {
            if ($data[$meter['field']] == 1 && !empty($data[$meter['serial']])) {
                $sql = "INSERT INTO metersserialnumber (userId, typeOfMeter, serialNum) 
                        VALUES (:userId, :typeOfMeter, :serialNum)";
                $stmt = $this->conn->prepare($sql);
                $stmt->bindParam(':userId', $userId);
                $stmt->bindParam(':typeOfMeter', $meter['typeOfMeter']);
                $stmt->bindParam(':serialNum', $data[$meter['serial']]);
                $stmt->execute();
            }
        }
    }
}

// Adatok fogadása és mentése
$data = json_decode(file_get_contents('php://input'), true);

$saveResidenceData = new SaveResidenceData($conn);
$saveResidenceData->saveData($data);

?>