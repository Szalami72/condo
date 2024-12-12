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
        MAX(CASE WHEN metersserialnumber.typeOfMeter = 'heating' THEN metersserialnumber.serialNum END) AS heatingSerialNumber,
        mv.cold1 AS cold1LastValue,
        mv.cold2 AS cold2LastValue,
        mv.hot1 AS hot1LastValue,
        mv.hot2 AS hot2LastValue,
        mv.heating AS heatingLastValue
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
    LEFT JOIN (
        SELECT 
            id, userId, cold1, cold2, hot1, hot2, heating
        FROM 
            metersvalues
        WHERE 
            userId = :id
        ORDER BY 
            id DESC
        LIMIT 1
    ) AS mv ON mv.userId = users.id
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
        commoncosts.typeOfCommoncosts, subdeposits.typeOfSubdeposits,
        mv.cold1, mv.cold2, mv.hot1, mv.hot2, mv.heating;
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
