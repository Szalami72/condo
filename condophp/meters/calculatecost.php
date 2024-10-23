<?php

require '../config/header.php';

class CalculateCost
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function calculate($data)
    {
        $userId = $data['userId'];
        $settings = $this->getSettings();
        $residentData = $this->getResidentData($userId);

        $payable = 0;
        $balance = $residentData['balance'];

        // Közös költség alapú fizetés számítása
        switch ($settings['commonCost']) {
            case 'fix':
                $payable += $settings['amountFix'];
                break;
            case 'smeter':
                $payable += $settings['amountSmeter'] * $residentData['squareMeter'];
                break;
            case 'perflat':
                $payable += $residentData['commonCost'];
                break;
        }

        // Közös költségek számítása
        $payable += $this->calcMetersCosts($settings, $data);
        $payable += $this->calcSubDepCosts($settings, $residentData);
        $payable += $this->calcExtraPayment($settings, $residentData);

        // Végső egyenleg kiszámítása
        $balance -= $payable;


        return array_merge(
            [
                'mayId' => $data['mayId'],
                'balance' => $balance,
                'payable' => $payable,
                'cold1Value' => $data['cold1'],
                'cold2Value' => $data['cold2'],
                'hot1Value' => $data['hot1'],
                'hot2Value' => $data['hot2'],
                'heatingValue' => $data['heating'],
                'squareMeter' => $residentData['squareMeter'],
                'subDeposit' => $residentData['subDeposit'],
                'ccost' => $residentData['commonCost']
            ],
            $settings
        );
    }

    private function calcMetersCosts($settings, $data)
    {
        $cold1 = $data['cold1'] ?? 0;
        $cold2 = $data['cold2'] ?? 0;
        $hot1 = $data['hot1'] ?? 0;
        $hot2 = $data['hot2'] ?? 0;
        $heating = $data['heating'] ?? 0;

        $coldAmount = $settings['coldAmount'] ?? 0;
        $hotAmount = $settings['hotAmount'] ?? 0;
        $heatingAmount = $settings['heatingAmount'] ?? 0;

        return ($coldAmount * ($cold1 + $cold2)) + ($hotAmount * ($hot1 + $hot2)) + ($heatingAmount * $heating);
    }

    private function calcSubDepCosts($settings, $residentData)
    {
        if (empty($residentData['subDeposit'])) {
            return 0;
        }

        if (!empty($settings['subDepFix'])) {
            return $settings['subDepFix'];
        }

        if (!empty($settings['subDepSmeter'])) {
            return $settings['subDepSmeter'] * $residentData['squareMeter'];
        }

        return 0;
    }

    private function calcExtraPayment($settings, $residentData)
    {
        if (empty($settings['extraPayment'])) {
            return 0;
        }

        if ($settings['extraPaymentMode'] == 'fix') {
            return $settings['extraPayment'];
        }

        if ($settings['extraPaymentMode'] == 'smeter') {
            return $settings['extraPayment'] * $residentData['squareMeter'];
        }

        return 0;
    }

    public function getSettings()
    {
        try {
            $sql = "SELECT title, value FROM settings";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();

            $settingsData = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $settings = [];
            foreach ($settingsData as $setting) {
                $settings[$setting['title']] = $setting['value'];
            }

            return $settings;
        } catch (PDOException $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    public function getResidentData($userId)
    {
        try {
            $sql = "
                SELECT 
                    r.squareMeterId, 
                    r.balance, 
                    s.typeOfSquareMeters, 
                    s.ccostForThis, 
                    s.subDepForThis, 
                    c.typeOfCommonCosts,
                    sd.typeOfSubDeposits
                FROM 
                    residents r
                JOIN 
                    squaremeters s ON r.squareMeterId = s.id
                JOIN 
                    commoncosts c ON s.ccostForThis = c.id
                LEFT JOIN 
                    subdeposits sd ON s.subDepForThis = sd.id
                WHERE 
                    r.userId = :userId
            ";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':userId' => $userId]);
            
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($data)) {
                $firstResident = $data[0];
                return [
                    'status' => 'success',
                    'commonCost' => $firstResident['typeOfCommonCosts'],
                    'squareMeter' => $firstResident['typeOfSquareMeters'],
                    'subDeposit' => $firstResident['typeOfSubDeposits'],
                    'balance' => $firstResident['balance'],
                ];
            } else {
                return ['status' => 'error', 'message' => 'No resident data found'];
            }
        } catch (PDOException $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }
}
