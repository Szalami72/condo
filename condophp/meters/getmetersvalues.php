<?php

require '../config/header.php';

class GetMetersValues
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }


    public function fetchMeters($monthAndYear)
    {
        try {
            // Lekérdezés a monthandyear tábla id-jének megszerzésére
            $sql = "SELECT id FROM monthandyear WHERE monthAndYear = :monthAndYear";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':monthAndYear' => $monthAndYear]);
            $monthAndYearId = $stmt->fetchColumn();

            if (!$monthAndYearId) {
                return ['status' => 'error', 'message' => 'Invalid monthAndYear value'];
            }

            // Lekérdezés a residents és metersvalues adatainak megszerzésére
            $sql = "SELECT 
                users.id AS userId, 
                users.username, 
                buildings.typeOfBuildings, 
                floors.typeOfFloors, 
                doors.typeOfDoors,
                metersvalues.typeOfMeter,
                metersvalues.valueOfMeter 
            FROM 
                users 
            LEFT JOIN 
                residents 
            ON 
                users.id = residents.userId
            LEFT JOIN 
                buildings 
            ON 
                residents.buildingId = buildings.id
            LEFT JOIN 
                floors 
            ON 
                residents.floorId = floors.id
            LEFT JOIN 
                doors 
            ON 
                residents.doorId = doors.id
            LEFT JOIN 
                metersvalues 
            ON 
                users.id = metersvalues.userId
            AND 
                metersvalues.mayId = :monthAndYearId
            WHERE
                adminLevel != 0
            ;"; 
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':monthAndYearId' => $monthAndYearId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Az adatok csoportosítása
            $meters = [];
            foreach ($rows as $row) {
                $userId = $row['userId'];
                if (!isset($meters[$userId])) {
                    $meters[$userId] = [
                        'userId' => $userId,
                        'username' => $row['username'],
                        'typeOfBuildings' => $row['typeOfBuildings'],
                        'typeOfFloors' => $row['typeOfFloors'],
                        'typeOfDoors' => $row['typeOfDoors']
                    ];
                }

                if ($row['typeOfMeter'] !== null) {
                    $meters[$userId][$row['typeOfMeter']] = $row['valueOfMeter'];
                }
            }

            return array_values($meters);
        } catch (PDOException $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }
}

try {
  

    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['monthAndYear'])) {
        $monthAndYear = $input['monthAndYear'];
        $fetcher = new GetMetersValues($conn);
        $data = $fetcher->fetchMeters($monthAndYear);
        echo json_encode(['status' => 'success', 'data' => $data]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Missing user ID']);
    }

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

