<?php

require '../config/header.php';

class GetUsedMeters {
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    // Lekéri a squaremeters táblából az id-t a megadott squareMeter alapján
    public function getUsedMeters($squareMeter)
    {
        $sql = "SELECT id FROM squaremeters WHERE typeOfSquareMeters = :squareMeter";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':squareMeter' => $squareMeter]); // Egyszerűsített bindParam
        return $stmt->fetchColumn(); // Csak az id-t adja vissza
    }

    // Lekéri a residents táblából az userId-t a squareMeterId alapján
    public function getUserIdBySquareMeterId($squareMeterId)
    {
        $sql = "SELECT userId FROM residents WHERE squareMeterId = :squareMeterId LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':squareMeterId' => $squareMeterId]); 
        return $stmt->fetchColumn(); // Csak az userId-t adja vissza
    }

    // Lekéri a metersserialnumber táblából az adatokat userId alapján
    public function getMeterSerialNumbersByUserId($userId)
    {
        $sql = "SELECT typeOfMeter FROM metersserialnumber WHERE userId = :userId";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':userId' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN); // Csak a typeOfMeter oszlopokat adja vissza
    }
}

// Példa használat
try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents("php://input"), true);

    if (empty($input['squareMeter'])) {
        throw new Exception('squareMeter parameter is missing');
    }

    $squareMeter = $input['squareMeter'];
    $getUsedMeters = new GetUsedMeters($conn);
    
    // Lekérjük a squareMeterId-t
    if (!$squareMeterId = $getUsedMeters->getUsedMeters($squareMeter)) {
        throw new Exception('No matching squareMeterId found');
    }
    
    // Lekérjük az userId-t a squareMeterId alapján
    if (!$userId = $getUsedMeters->getUserIdBySquareMeterId($squareMeterId)) {
        throw new Exception('No matching userId found');
    }
    
    // Lekérjük a metersserialnumber adatokat az userId alapján
    if (!$metersTypes = $getUsedMeters->getMeterSerialNumbersByUserId($userId)) {
        throw new Exception('No matching meter serial numbers found');
    }

    // Sikeres válasz
    echo json_encode(['status' => 'success', 'metersTypes' => $metersTypes]);

} catch (Exception $e) {
    // Hibaüzenet egyszerű kezelése
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
} catch (PDOException $e) {
    // Adatbázis kapcsolat hiba
    echo json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]);
}

?>
