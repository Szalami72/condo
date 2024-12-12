<?php
require '../config/header.php';
require '../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;

class SaveResidentData
{
    private $conn;
    private $mailer;

    public function __construct($conn)
    {
        $this->conn = $conn;
        $this->mailer = new PHPMailer(true);
        $this->configureSMTP(); 
    }

    private function configureSMTP() {
        $smtpConfig = require '../config/smtp_config.php'; 
    
        $this->mailer->isSMTP();
        $this->mailer->Host = $smtpConfig['host'];
        $this->mailer->Port = $smtpConfig['port'];
        $this->mailer->SMTPAuth = $smtpConfig['smtp_auth'];
        $this->mailer->Username = $smtpConfig['username'];
        $this->mailer->Password = $smtpConfig['password'];
        $this->mailer->SMTPSecure = $smtpConfig['smtp_secure'];
        $this->mailer->CharSet = $smtpConfig['charset'];
    
        // Debug üzemmód beállítása
        $this->mailer->SMTPDebug = 2;  // 2 a teljes debug információ, 1 pedig csak az alapok
        $this->mailer->Debugoutput = 'error_log'; // Logolás az error_log-ba
    }
    

    private function sendEmailToNewResident($email, $password) {
        try {
            // Email beállítások
            $this->mailer->setFrom('admin@mycondo.hu', 'MyCondo.hu');
            $this->mailer->addAddress($email);
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Új regisztráció';
            $this->mailer->Body  = "A társasház honlapján regisztrálták önt.<br>" .
            "<a href='https://mycondo.hu'>MyCondo.hu</a><br><br>" .
            "Belépési adatok:<br>" .
            "Email: {$email}<br>" .
            "Jelszó: {$password}<br>" .
            "Az adatai biztonsága érdekében változtassa meg a jelszavát!<br>";
    
            $this->mailer->send();
        } catch (Exception $e) {
            // Hiba logolása
            error_log("Email could not be sent. PHPMailer Error: {$e->getMessage()}");
            echo "Email could not be sent. PHPMailer Error: {$e->getMessage()}";
        }
    }
    

    function generatePassword($length = 8) {
        $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $password = '';
        $charactersLength = strlen($characters);
        
        for ($i = 0; $i < $length; $i++) {
            $password .= $characters[rand(0, $charactersLength - 1)];
        }
        
        return $password;
    }
    public function saveData($data)
    {
        try {

            if ($this->emailExists($data['email'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Ez az email cím már használatban van."
                ]);
                return;
            }
            // Tranzakció indítása
            $this->conn->beginTransaction();

            // Felhasználó jelszavának hashelése
            $newPassword = $this->generatePassword();
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

            // Felhasználó létrehozása a users táblában
            $sql = "INSERT INTO users (username, email, phone, adminLevel, password) 
                    VALUES (:username, :email, :phone, :adminLevel, :password)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':username', $data['username']);
            $stmt->bindParam(':email', $data['email']);
            $stmt->bindParam(':phone', $data['phone']);
            $stmt->bindParam(':adminLevel', $data['adminLevel']);
            $stmt->bindParam(':password', $hashedPassword);
            $stmt->execute();
            
            // Felhasználó id-jének lekérdezése
            $userId = $this->conn->lastInsertId();

            // Épület adatok ellenőrzése és mentése
            $buildingId = 0;
            $floorId = 0;
            $doorId = 0;
            $commonCostId = 0;
            $squareMeterId = 0;
            $subDepositId = 0;

            if(!empty($data['building'])) {
                $buildingId = $this->saveOrUpdate('buildings', 'typeOfBuildings', $data['building']);
            }

            // Emelet adatok ellenőrzése és mentése
            if(!empty($data['floor'])) {
                $floorId = $this->saveOrUpdate('floors', 'typeOfFloors', $data['floor']);
            }

            // Ajtó adatok ellenőrzése és mentése
            if(!empty($data['door'])) {
                $doorId = $this->saveOrUpdate('doors', 'typeOfDoors', $data['door']);
            }

            // Közös költség adatok ellenőrzése és mentése
            if (!empty($data['commoncost'])) {
                $commonCostId = $this->saveOrUpdate('commoncosts', 'typeOfCommoncosts', $data['commoncost']);
            }

            // Albetéti díj ellenőrzése és mentése
            if (!empty($data['subDeposit'])) {
                $subDepositId = $this->saveOrUpdate('subdeposits', 'typeOfSubdeposits', $data['subDeposit']);
            }

            // Négyzetméter adatok ellenőrzése és mentése
            if(!empty($data['squareMeter'])) {
                $squareMeterId = $this->saveOrUpdateSquareMeters('squaremeters', 'typeOfSquareMeters', $data['squareMeter'], $subDepositId, $commonCostId);
            }

            // Balance tábla frissítése
            $sql = "INSERT INTO balance (userId, value) VALUES (:userId, :balance)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':userId', $userId);
            $stmt->bindParam(':balance', $data['balance']);
            $stmt->execute();

            // Meters serial number tábla frissítése
            $this->saveMeterSerialNumbers($userId, $data);

            // Residences tábla frissítése
            $sql = "INSERT INTO residents (userId, buildingId, floorId, doorId, squareMeterId, isMeters, commonCost) 
                    VALUES (:userId, :buildingId, :floorId, :doorId, :squareMeterId, :isMeters, :commonCost)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':userId', $userId);
            $stmt->bindParam(':buildingId', $buildingId);
            $stmt->bindParam(':floorId', $floorId);
            $stmt->bindParam(':doorId', $doorId);
            $stmt->bindParam(':squareMeterId', $squareMeterId);
            $stmt->bindParam(':isMeters', $data['isMeter']);
            $stmt->bindParam(':commonCost', $commonCostId);
            $stmt->execute();


            // utolsó óraállás rögzítése
            $monthAndYear = $data['monthAndYear'];
            $cold1LastValue = $data['cold1LastValue'];
            $cold2LastValue = $data['cold2LastValue'];
            $hot1LastValue = $data['hot1LastValue'];
            $hot2LastValue = $data['hot2LastValue'];
            $heatingLastValue = $data['heatingLastValue'];

            // Ellenőrizzük, hogy van-e már bejegyzés a monthandyear táblában
            $sql = "SELECT id FROM monthandyear WHERE monthAndYear = :monthAndYear";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':monthAndYear' => $monthAndYear]);
            $mayId = $stmt->fetchColumn();

            if (!$mayId) {
                // Ha nincs, új bejegyzés a monthandyear táblába
                $sql = "INSERT INTO monthandyear (monthAndYear) VALUES (:monthAndYear)";
                $stmt = $this->conn->prepare($sql);
                $stmt->execute([':monthAndYear' => $monthAndYear]);
                $mayId = $this->conn->lastInsertId();
            }

            $sql = "INSERT INTO metersvalues (userId, mayId, cold1, cold2, hot1, hot2, heating) 
        VALUES (:userId, :mayId, :cold1, :cold2, :hot1, :hot2, :heating)";

            $stmt = $this->conn->prepare($sql); 


            // Paraméterek bindelése
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':mayId', $mayId, PDO::PARAM_INT);
            $stmt->bindParam(':cold1', $cold1LastValue);
            $stmt->bindParam(':cold2', $cold2LastValue);
            $stmt->bindParam(':hot1', $hot1LastValue);
            $stmt->bindParam(':hot2', $hot2LastValue);
            $stmt->bindParam(':heating', $heatingLastValue);

            // Lekérdezés futtatása
            $stmt->execute();

            
            // Tranzakció befejezése
            $this->conn->commit();

            $this->sendEmailToNewResident($data['email'], $newPassword);

            echo json_encode([
                "success" => true,
                "message" => "Felhasználó sikeresen létrehozva."
            ]);
    
        } catch (Exception $e) {
            $this->conn->rollBack();
            echo json_encode([
                "success" => false,
                "message" => "Hiba történt a mentés során: " . $e->getMessage()
            ]);
        }
    }

    private function emailExists($email)
{
    $sql = "SELECT id FROM users WHERE email = :email";
    $stmt = $this->conn->prepare($sql);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    return $result ? true : false;
}
    private function saveOrUpdate($table, $columnName, $value)
    {
        // Ellenőrizzük, hogy van-e már ilyen érték a táblában
        $sql = "SELECT id FROM $table WHERE $columnName = :value";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':value', $value);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            return $result['id']; // Ha már van ilyen érték, visszaadjuk az id-t
        } else {
            // Ha nincs, beszúrjuk az új értéket és visszaadjuk az újonnan generált id-t
            $sql = "INSERT INTO $table ($columnName) VALUES (:value)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':value', $value);
            $stmt->execute();
            return $this->conn->lastInsertId();
        }
    }

    private function saveOrUpdateSquareMeters($table, $columnName, $value, $subDepositId, $commonCostId)
    {
        // Ellenőrizzük, hogy van-e már ilyen érték a táblában
        $sql = "SELECT id, ccostForThis, subDepForThis FROM $table WHERE $columnName = :value";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':value', $value);

        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            // Ha már van ilyen érték, visszaadjuk az id-t
            $existingId = $result['id'];

            // Ellenőrizzük és frissítjük az ccostForThis mezőt, ha szükséges
            if (empty($result['ccostForThis']) || $result['ccostForThis'] == 0) {
                $sql = "UPDATE $table SET ccostForThis = :commonCostId WHERE id = :id";
                $stmt = $this->conn->prepare($sql);
                $stmt->bindParam(':commonCostId', $commonCostId);
                $stmt->bindParam(':id', $existingId);
                $stmt->execute();
            }

            // Ellenőrizzük és frissítjük az subDepForThis mezőt, ha szükséges
            if (empty($result['subDepForThis']) || $result['subDepForThis'] == 0) {
                $sql = "UPDATE $table SET subDepForThis = :subDepositId WHERE id = :id";
                $stmt = $this->conn->prepare($sql);
                $stmt->bindParam(':subDepositId', $subDepositId);
                $stmt->bindParam(':id', $existingId);
                $stmt->execute();
            }

            return $existingId;
        } else {
            // Ha nincs, beszúrjuk az új értéket és visszaadjuk az újonnan generált id-t
            $sql = "INSERT INTO $table ($columnName, ccostForThis, subDepForThis) VALUES (:value, :commonCostId, :subDepositId)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':value', $value);
            $stmt->bindParam(':commonCostId', $commonCostId);
            $stmt->bindParam(':subDepositId', $subDepositId);

            $stmt->execute();
            return $this->conn->lastInsertId();
        }
    }

    private function saveMeterSerialNumbers($userId, $data)
    {
        // Megjegyezzük a létrejött id-t és a megfelelő meterId-t
        $meterSerials = [
            ['field' => 'cold1', 'serial' => 'cold1SerialNumber', 'typeOfMeter' => 'cold1'],
            ['field' => 'hot1', 'serial' => 'hot1SerialNumber', 'typeOfMeter' => 'hot1'],
            ['field' => 'cold2', 'serial' => 'cold2SerialNumber', 'typeOfMeter' => 'cold2'],
            ['field' => 'hot2', 'serial' => 'hot2SerialNumber', 'typeOfMeter' => 'hot2'],
        ];

        foreach ($meterSerials as $meter) {
            if ($data[$meter['field']] == 1) {
                $sql = "INSERT INTO metersserialnumber (userId, typeOfMeter, serialNum) 
                        VALUES (:userId, :typeOfMeter, :serialNum)";
                $stmt = $this->conn->prepare($sql);
                $stmt->bindParam(':userId', $userId);
                $stmt->bindParam(':typeOfMeter', $meter['typeOfMeter']);
                $stmt->bindParam(':serialNum', $data[$meter['serial']]);
                $stmt->execute();
            }
        }
    }
}

// Adatok fogadása és mentése
$data = json_decode(file_get_contents('php://input'), true);

$saveResidenceData = new SaveResidentData($conn);
$saveResidenceData->saveData($data);

?>
