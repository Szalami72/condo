<?php

require '../config/header.php';

class SaveCosts
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function saveCosts($costsData)
    {
        $this->saveOrUpdateSetting('commonCost', $costsData['commonCost'] ?? null);
        $this->saveOrUpdateSetting('amountSmeter', $costsData['amountSmeter'] ?? null);
        $this->saveOrUpdateSetting('amountFix', $costsData['amountFix'] ?? null);
        $this->saveOrUpdateSetting('subDepSmeter', $costsData['subDepSmeter'] ?? null);
        $this->saveOrUpdateSetting('subDepFix', $costsData['subDepFix'] ?? null);
        $this->saveOrUpdateSetting('extraPayment', $costsData['extraPayment'] ?? null);
        $this->saveOrUpdateSetting('extraPaymentMode', $costsData['extraPaymentMode'] ?? null);
        $this->saveOrUpdateSetting('extraPaymentTitle', $costsData['extraPaymentTitle'] ?? null);
        $this->saveOrUpdateSetting('calculateCost', $costsData['calculate'] ?? null);

    }

    private function saveOrUpdateSetting($title, $value)
    {
        if ($value === null) {
            return; 
        }

     
        $query = "SELECT COUNT(*) FROM settings WHERE title = :title";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':title' => $title]);
        $exists = $stmt->fetchColumn();

        if ($exists) {
    
            $updateQuery = "UPDATE settings SET value = :value WHERE title = :title";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->execute([':value' => $value, ':title' => $title]);
        } else {
     
            $insertQuery = "INSERT INTO settings (title, value) VALUES (:title, :value)";
            $insertStmt = $this->conn->prepare($insertQuery);
            $insertStmt->execute([':title' => $title, ':value' => $value]);
        }
    }
}


$data = json_decode(file_get_contents("php://input"), true);

if (json_last_error() === JSON_ERROR_NONE) {
    $saveCosts = new SaveCosts($conn);
    $saveCosts->saveCosts($data);
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON data']);
}


?>
