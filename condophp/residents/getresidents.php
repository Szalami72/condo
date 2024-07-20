<?php

require '../config/header.php';

class GetResidents {
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function fetchResidents()
    {
        try {
            $sql = "SELECT 
                users.id AS userId, 
                users.username, 
                users.email, 
                buildings.typeOfBuildings, 
                floors.typeOfFloors, 
                doors.typeOfDoors 
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
            WHERE
                adminLevel != 0
            ;"; 
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $residents = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
            return json_encode(['status' => 'success', 'data' => $residents]);
        } catch (PDOException $e) {
            return json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}  

try {
  

    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $fetcher = new GetResidents($conn);
    echo $fetcher->fetchResidents();
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
