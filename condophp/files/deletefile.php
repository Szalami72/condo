<?php
require '../config/header.php';  

class DeleteFileById
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function getFileById($id)
    {
        try {
            $sql = "SELECT id, fileName, filePath FROM files WHERE id = :id LIMIT 1";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT); 
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return false;
        }
    }

    public function deleteFileFromDatabase($id)
    {
        try {
            $sql = "DELETE FROM files WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return false;
        }
    }

    public function deleteFileFromServer($filePath)
    {
        // Konvertáljuk a webes URL-t helyi fájl elérési útra
        $absolutePath = $_SERVER['DOCUMENT_ROOT'] . str_replace('http://localhost', '', $filePath);

        error_log("Attempting to delete file: " . $absolutePath);  // Debug output
        if (file_exists($absolutePath)) {
            if (unlink($absolutePath)) {
                error_log("File successfully deleted: " . $absolutePath);
                return true;
            } else {
                error_log("Failed to delete file: " . $absolutePath);
                return false;
            }
        } else {
            error_log("File does not exist: " . $absolutePath);
            return false;
        }
    }
}

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $id = isset($data['id']) ? (int)$data['id'] : 0;

    if ($id > 0) {
        $deleteFileById = new DeleteFileById($conn);

        // Fájl adatok lekérése az adatbázisból
        $file = $deleteFileById->getFileById($id);

        if ($file) {
            // Fájl törlése az adatbázisból
            $dbDeleted = $deleteFileById->deleteFileFromDatabase($id);

            // Ha az adatbázisból sikeresen töröltük, akkor töröljük a fájlt a szerverről is
            if ($dbDeleted && $deleteFileById->deleteFileFromServer($file['filePath'])) {
                echo json_encode(['status' => 'success', 'message' => 'Fájl sikeresen törölve.']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Fájl törlése az adatbázisból sikerült, de a szerverről nem.']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Fájl nem található.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Érvénytelen ID.']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
