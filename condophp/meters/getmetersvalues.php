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

            // if (!$monthAndYearId) {
            //     return ['status' => 'error', 'message' => 'Invalid monthAndYear value'];
            // }

            // Lekérdezés a residents és metersvalues adatainak megszerzésére
            $sql = "SELECT 
                users.id AS userId, 
                users.username,
                residents.isMeters, 
                buildings.typeOfBuildings, 
                floors.typeOfFloors, 
                doors.typeOfDoors,
                metersvalues.cold1,
                metersvalues.cold2,
                metersvalues.hot1,
                metersvalues.hot2,
                metersvalues.heating
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
                users.adminLevel != 0
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
                        'isMeters' => $row['isMeters'],
                        'typeOfBuildings' => $row['typeOfBuildings'],
                        'typeOfFloors' => $row['typeOfFloors'],
                        'typeOfDoors' => $row['typeOfDoors'],
                        'cold1' => $row['cold1'],
                        'cold2' => $row['cold2'],
                        'hot1' => $row['hot1'],
                        'hot2' => $row['hot2'],
                        'heating' => $row['heating']
                    ];
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

