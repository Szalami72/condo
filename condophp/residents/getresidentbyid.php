<?php

require '../config/header.php';

class DataFetcher
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function getResidentById($id)
    {
        $sql = "
 
    SELECT 
    users.id AS userId,
    users.username,
    users.email,
    users.phone,
    users.adminLevel,
    balance.value AS balance,
    residents.buildingId,
    buildings.typeOfBuildings,
    residents.floorId,
    floors.typeOfFloors,
    residents.doorId,
    doors.typeOfDoors,
    residents.squareMeterId,
    squaremeters.typeOfSquareMeters,
    squaremeters.ccostForThis,
    squaremeters.subDepForThis,
    residents.isMeters,
    residents.commonCost,
    commoncosts.typeOfCommoncosts,
    subdeposits.typeOfSubdeposits,
    MAX(CASE WHEN metersserialnumber.typeOfMeter = 'cold1' THEN metersserialnumber.serialNum END) AS cold1SerialNumber,
    MAX(CASE WHEN metersserialnumber.typeOfMeter = 'cold2' THEN metersserialnumber.serialNum END) AS cold2SerialNumber,
    MAX(CASE WHEN metersserialnumber.typeOfMeter = 'hot1' THEN metersserialnumber.serialNum END) AS hot1SerialNumber,
    MAX(CASE WHEN metersserialnumber.typeOfMeter = 'hot2' THEN metersserialnumber.serialNum END) AS hot2SerialNumber,
    MAX(CASE WHEN metersserialnumber.typeOfMeter = 'heating' THEN metersserialnumber.serialNum END) AS heatingSerialNumber
FROM 
    users
LEFT JOIN 
    residents ON users.id = residents.userId
LEFT JOIN 
    buildings ON residents.buildingId = buildings.id
LEFT JOIN 
    floors ON residents.floorId = floors.id
LEFT JOIN 
    doors ON residents.doorId = doors.id
LEFT JOIN 
    squaremeters ON residents.squareMeterId = squaremeters.id
LEFT JOIN 
    commoncosts ON residents.commonCost = commoncosts.id
LEFT JOIN
    subdeposits ON squaremeters.subDepForThis = subdeposits.id
LEFT JOIN
    balance ON balance.userId = users.id
LEFT JOIN
    metersserialnumber ON residents.userId = metersserialnumber.userId
WHERE 
    users.id = :id
GROUP BY 
    users.id, users.username, users.email, users.phone, users.adminLevel, balance.value,
    residents.buildingId, buildings.typeOfBuildings,
    residents.floorId, floors.typeOfFloors,
    residents.doorId, doors.typeOfDoors,
    residents.squareMeterId, squaremeters.typeOfSquareMeters,
    squaremeters.ccostForThis, squaremeters.subDepForThis,
    residents.isMeters, residents.commonCost,
    commoncosts.typeOfCommoncosts, subdeposits.typeOfSubdeposits;

";



        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ? $result : null;
    }

    
}

try {
  

    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['id'])) {
        $userId = $input['id'];
        $fetcher = new DataFetcher($conn);
        $data = $fetcher->getResidentById($userId);
        echo json_encode(['status' => 'success', 'data' => $data]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Missing user ID']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
