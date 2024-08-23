<?php

require '../config/header.php';  

class SaveFile
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function saveFile()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (isset($_FILES['file']) && isset($_POST['description'])) {
                $description = $_POST['description'];

                // A szerver abszolút elérési útvonalának megadása
                $targetDirectory = $_SERVER['DOCUMENT_ROOT'] . '/condophp/uploads/';
                
                // A fájl neve
                $fileName = basename($_FILES['file']['name']);
                
                // A célfájl teljes útvonala a szerveren
                $targetFile = $targetDirectory . $fileName;

                // A webes elérési útvonal az adatbázisban tárolásra
                $filePath = 'http://localhost/condophp/uploads/' . $fileName;

                // Fájl feltöltése a szerverre
                if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
                    try {
                        $sql = "INSERT INTO files (description, fileName, filePath) VALUES (:description, :fileName, :filePath)";
                        $stmt = $this->conn->prepare($sql);

                        $stmt->bindParam(':description', $description);
                        $stmt->bindParam(':fileName', $fileName);
                        $stmt->bindParam(':filePath', $filePath);

                        if ($stmt->execute()) {
                            echo json_encode(['status' => 'success']);
                        } else {
                            http_response_code(500);
                            echo json_encode(['status' => 'error', 'message' => 'Nem sikerült menteni az adatbázisba.']);
                        }
                    } catch (PDOException $e) {
                        http_response_code(500);
                        echo json_encode(['status' => 'error', 'message' => 'Adatbázis hiba: ' . $e->getMessage()]);
                    }
                } else {
                    http_response_code(500);
                    echo json_encode(['status' => 'error', 'message' => 'Fájl feltöltése sikertelen!']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Hiányzó fájl vagy leírás!']);
            }
        } else {
            http_response_code(405);
            echo json_encode(['status' => 'error', 'message' => 'Nem támogatott HTTP metódus!']);
        }
    }
}

$saveFile = new SaveFile($conn);
$saveFile->saveFile();

?>
