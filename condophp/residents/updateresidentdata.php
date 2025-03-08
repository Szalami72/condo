<?php
require '../config/header.php';

class SaveResidentDataUpdate
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function updateData($data)
    {
        try {
            // Tranzakció indítása
            $this->conn->beginTransaction();

            // Ellenőrizzük, hogy a felhasználó létezik-e
            $sql = "SELECT id FROM users WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':id', $data['id']);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$result) {
                throw new Exception("User not found");
            }

            $userId = $result['id'];

            // Felhasználói adatok frissítése
            $sql = "UPDATE users SET username = :username, email = :email, phone = :phone, adminLevel = :adminLevel WHERE id = :userId";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':username', $data['username']);
            $stmt->bindParam(':email', $data['email']);
            $stmt->bindParam(':phone', $data['phone']);
            $stmt->bindParam(':adminLevel', $data['adminLevel']);
            $stmt->bindParam(':userId', $userId);
            $stmt->execute();

            // Épület, emelet, ajtó stb. kezelése
            $buildingId = $this->saveOrUpdate('buildings', 'typeOfBuildings', $data['building'] ?? null);
            $floorId = $this->saveOrUpdate('floors', 'typeOfFloors', $data['floor'] ?? null);
            $doorId = $this->saveOrUpdate('doors', 'typeOfDoors', $data['door'] ?? null);
            $commonCostId = $this->saveOrUpdate('commoncosts', 'typeOfCommoncosts', $data['commoncost'] ?? null);
            $subDepositId = $this->saveOrUpdate('subdeposits', 'typeOfSubdeposits', $data['subDeposit'] ?? null);
            $squareMeterId = $this->saveOrUpdateSquareMeters('squaremeters', 'typeOfSquareMeters', $data['squareMeter'] ?? 0, $subDepositId, $commonCostId);

            // Balance tábla frissítése
            $sql = "UPDATE balance SET value = :balance WHERE userId = :userId";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':balance', $data['balance']);
            $stmt->bindParam(':userId', $userId);
            $stmt->execute();

            // Meter serial number frissítése
            $this->saveMeterSerialNumbers($userId, $data);
            $this->updateLastMetersValues($userId, $data);

            // Residences tábla frissítése
            $sql = "UPDATE residents SET buildingId = :buildingId, floorId = :floorId, doorId = :doorId, squareMeterId = :squareMeterId, isMeters = :isMeters, commonCost = :commonCost 
                    WHERE userId = :userId";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':buildingId', $buildingId);
            $stmt->bindParam(':floorId', $floorId);
            $stmt->bindParam(':doorId', $doorId);
            $stmt->bindParam(':squareMeterId', $squareMeterId);
            $stmt->bindParam(':isMeters', $data['isMeter']);
            $stmt->bindParam(':commonCost', $commonCostId);
            $stmt->bindParam(':userId', $userId);
            $stmt->execute();

            // Ha minden sikeres, commit
            $this->conn->commit();
            echo json_encode(["message" => "Update successful"]);
        } catch (Exception $e) {
            // Hibák esetén rollback
            $this->conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    private function saveOrUpdate($table, $columnName, $value)
    {
        if (!$value) {
            return 0; // Ha nincs érték, nullát adunk vissza
        }

        $sql = "SELECT id FROM $table WHERE $columnName = :value";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':value', $value);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            return $result['id'];
        } else {
            $sql = "INSERT INTO $table ($columnName) VALUES (:value)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':value', $value);
            $stmt->execute();
            return $this->conn->lastInsertId();
        }
    }

   
    private function saveOrUpdateSquareMeters($table, $columnName, $value, $subDepositId, $commonCostId)
    {
        // Ellenőrizzük, hogy van-e már ilyen érték a táblában
        $sql = "SELECT id, ccostForThis, subDepForThis FROM $table WHERE $columnName = :value";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':value', $value);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            // Ha már van ilyen érték, visszaadjuk az id-t
            $existingId = $result['id'];

            // Ellenőrizzük és frissítjük az ccostForThis mezőt, ha szükséges
            if (empty($result['ccostForThis']) || $result['ccostForThis'] == 0) {
                $sql = "UPDATE $table SET ccostForThis = :commonCostId WHERE id = :id";
                $stmt = $this->conn->prepare($sql);
                $stmt->bindParam(':commonCostId', $commonCostId);
                $stmt->bindParam(':id', $existingId);
                $stmt->execute();
            }

            // Ellenőrizzük és frissítjük az subDepForThis mezőt, ha szükséges
            if (empty($result['subDepForThis']) || $result['subDepForThis'] == 0) {
                $sql = "UPDATE $table SET subDepForThis = :subDepositId WHERE id = :id";
                $stmt = $this->conn->prepare($sql);
                $stmt->bindParam(':subDepositId', $subDepositId);
                $stmt->bindParam(':id', $existingId);
                $stmt->execute();
            }

            return $existingId;
        } else {
            // Ha nincs, beszúrjuk az új értéket és visszaadjuk az újonnan generált id-t
            $sql = "INSERT INTO $table ($columnName, ccostForThis, subDepForThis) VALUES (:value, :commonCostId, :subDepositId)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':value', $value);
            $stmt->bindParam(':commonCostId', $commonCostId);
            $stmt->bindParam(':subDepositId', $subDepositId);
            $stmt->execute();
            return $this->conn->lastInsertId();
        }
    }

    private function saveMeterSerialNumbers($userId, $data)
{
    $meterSerials = [
        ['field' => 'cold1', 'serial' => 'cold1SerialNumber', 'typeOfMeter' => 'cold1'],
        ['field' => 'hot1', 'serial' => 'hot1SerialNumber', 'typeOfMeter' => 'hot1'],
        ['field' => 'cold2', 'serial' => 'cold2SerialNumber', 'typeOfMeter' => 'cold2'],
        ['field' => 'hot2', 'serial' => 'hot2SerialNumber', 'typeOfMeter' => 'hot2'],
        ['field' => 'heating', 'serial' => 'heatingSerialNumber', 'typeOfMeter' => 'heating'],
    ];

    foreach ($meterSerials as $meter) {
        if ($data[$meter['field']] == 1) {
            // Ellenőrizzük, hogy a serial number létezik-e
            $sql = "SELECT id FROM metersserialnumber WHERE userId = :userId AND typeOfMeter = :typeOfMeter";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':userId', $userId);
            $stmt->bindParam(':typeOfMeter', $meter['typeOfMeter']);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result) {
                // Ha létezik, akkor frissítjük a serial számot
                $sql = "UPDATE metersserialnumber 
                        SET serialNum = :serialNum 
                        WHERE userId = :userId AND typeOfMeter = :typeOfMeter";
                $stmt = $this->conn->prepare($sql);
                $stmt->bindParam(':serialNum', $data[$meter['serial']]);
                $stmt->bindParam(':userId', $userId);
                $stmt->bindParam(':typeOfMeter', $meter['typeOfMeter']);
                $stmt->execute();
            } else {
                // Ha nem létezik, akkor beszúrjuk az új adatot
                $sql = "INSERT INTO metersserialnumber (userId, typeOfMeter, serialNum) 
                        VALUES (:userId, :typeOfMeter, :serialNum)";
                $stmt = $this->conn->prepare($sql);
                $stmt->bindParam(':userId', $userId);
                $stmt->bindParam(':typeOfMeter', $meter['typeOfMeter']);
                $stmt->bindParam(':serialNum', $data[$meter['serial']]);
                $stmt->execute();
            }
        } elseif ($data[$meter['field']] == 0) {
            // Ha az érték false, akkor töröljük a meglévő adatot
            $sql = "DELETE FROM metersserialnumber WHERE userId = :userId AND typeOfMeter = :typeOfMeter";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':userId', $userId);
            $stmt->bindParam(':typeOfMeter', $meter['typeOfMeter']);
            $stmt->execute();
        }
    }
}

    private function updateLastMetersValues($userId, $data) {
         // utolsó óraállás rögzítése
         $monthAndYear = $data['monthAndYear'];
         $cold1LastValue = $data['cold1LastValue'];
         $cold2LastValue = $data['cold2LastValue'];
         $hot1LastValue = $data['hot1LastValue'];
         $hot2LastValue = $data['hot2LastValue'];
         $heatingLastValue = $data['heatingLastValue'];

         // Ellenőrizzük, hogy van-e már bejegyzés a monthandyear táblában
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

        // Az új rekord beszúrása a metersvalues táblába
            $sql = "INSERT INTO metersvalues (userId, mayId, cold1, cold2, hot1, hot2, heating) 
            VALUES (:userId, :mayId, :cold1, :cold2, :hot1, :hot2, :heating)";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
            ':userId' => $userId,
            ':mayId' => $mayId,
            ':cold1' => $cold1LastValue,
            ':cold2' => $cold2LastValue,
            ':hot1' => $hot1LastValue,
            ':hot2' => $hot2LastValue,
            ':heating' => $heatingLastValue
            ]);


    }
}

// Adatok fogadása és frissítése
$data = json_decode(file_get_contents('php://input'), true);

$saveResidenceDataUpdate = new SaveResidentDataUpdate($conn);
$saveResidenceDataUpdate->updateData($data);

?>
