<?php

require '../config/header.php';

class CalculateCost
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function calculate($data)
    {
        $userId = $data['userId'];

        // Lekérdezzük a beállításokat
        $settings = $this->getSettings();

        // Lekérdezzük a resident adatokat
        $residentData = $this->getResidentData($userId);

        // Számítási műveletek itt
        // Például, ha van szükség a residentData és settings adatokra
        // $result = $someCalculationBasedOn($settings, $residentData);
        
        // Példa: csak egy dummy érték
        $result = [
            'settings' => $settings,
            'residentData' => $residentData,
            // Itt add hozzá a valódi számításokat
        ];

        return $result; // Visszaadod a számítás eredményét
    }

    public function getSettings()
{
    try {
        // Lekérdezés a settings táblából
        $sql = "SELECT title, value FROM settings";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        // Az összes sor lekérése
        $settingsData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Átalakítás asszociatív tömbbé
        $settings = [];
        foreach ($settingsData as $setting) {
            $settings[$setting['title']] = $setting['value'];
        }

        // Visszatérünk az asszociatív tömbbel
        return $settings;
    } catch (PDOException $e) {
        return ['status' => 'error', 'message' => $e->getMessage()];
    }
}


    public function getResidentData($userId)
{
    try {
        // Lekérdezés a residents táblából
        $sql = "
            SELECT 
                r.squareMeterId, 
                r.balance, 
                s.typeOfSquareMeters, 
                s.ccostForThis, 
                s.subDepForThis, 
                c.typeOfCommonCosts,
                sd.typeOfSubDeposits
            FROM 
                residents r
            JOIN 
                squaremeters s ON r.squareMeterId = s.id
            JOIN 
                commoncosts c ON s.ccostForThis = c.id
            JOIN 
                subdeposits sd ON s.subDepForThis = sd.id
            WHERE 
                r.userId = :userId
        ";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':userId' => $userId]);
        
        // Lekérjük az adatokat
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Ellenőrizzük, hogy van-e adat
        if (!empty($data)) {
            // Kiválasztjuk az első resident adatot
            $firstResident = $data[0];
            return [
                'status' => 'success',
                'commonCost' => $firstResident['typeOfCommonCosts'],
                'squareMeter' => $firstResident['typeOfSquareMeters'],
                'subDeposit' => $firstResident['typeOfSubDeposits'],
                'balance' => $firstResident['balance'],

            ];
        } else {
            return ['status' => 'error', 'message' => 'No resident data found'];
        }
    } catch (PDOException $e) {
        return ['status' => 'error', 'message' => $e->getMessage()];
    }
}

}
