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
        $getPrevValues = $this->getPreviousMetersValues($userId); //lekéri az utolsó és utolsó előtti óraállásokat
        $prevValues = $this->checkPrevValues($getPrevValues, $settings); //ellenőrzi hogy van-e előző óraállás  
        $residentData = $this->getResidentData($userId, $settings);
        $bankAccount = $this->getBankAccount();

        $payable = 0;
        $balance = $residentData['balance'];

      

        // költségek számítása
        $metersCost = $this->calcMetersCosts($settings, $data, $prevValues);
        $payable += $metersCost;
        $subDepCost= $this->calcSubDepCosts($settings, $residentData);
        $payable += $subDepCost;
        $extraCost = $this->calcExtraPayment($settings, $residentData);
        $payable += $extraCost;
        $commonCost = $this->calculateCommonCosts($settings,$residentData, $subDepCost);
        $payable += $commonCost;

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
                'ccost' => $residentData['commonCost'],
                'email' => $residentData['email'],
                'bankAccount' => $bankAccount,
                'isMeters' => $residentData['isMeters'],
                'prevCold1Value' => $prevValues['cold1'],
                'prevCold2Value' => $prevValues['cold2'],
                'prevHot1Value' => $prevValues['hot1'],
                'prevHot2Value' => $prevValues['hot2'],
                'prevHeatingValue' => $prevValues['heating'],
                'metersCost' => $metersCost,
                'subDepCost' => $subDepCost,
                'extraCost' => $extraCost,
                'commonCostValue' => $commonCost
                
            ],
            $settings
        );

    }

    private function calculateCommonCosts($settings, $residentData, $subDepCost)
{
    if ($residentData['isMeters'] == 0) return $subDepCost;

    $options = [
        'fix' => $settings['amountFix'] ?? 0,
        'smeter' => ($settings['amountSmeter'] ?? 0) * $residentData['squareMeter'],
        'perflat' => $residentData['commonCost']
    ];

    return $options[$settings['commonCost']] ?? 0;
}

    

    private function calcMetersCosts($settings, $data, $prevValues)
    {
        // Jelenlegi értékek (ha hiányzik, 0-val helyettesítjük)
        $current = [
            'cold1' => $data['cold1'] ?? 0,
            'cold2' => $data['cold2'] ?? 0,
            'hot1' => $data['hot1'] ?? 0,
            'hot2' => $data['hot2'] ?? 0,
            'heating' => $data['heating'] ?? 0,
        ];
    
        // Előző értékek (ha hiányzik, 0-val helyettesítjük)
        $prev = [
            'cold1' => $prevValues['cold1'] ?? 0,
            'cold2' => $prevValues['cold2'] ?? 0,
            'hot1' => $prevValues['hot1'] ?? 0,
            'hot2' => $prevValues['hot2'] ?? 0,
            'heating' => $prevValues['heating'] ?? 0,
        ];
    
        // Fogyasztások kiszámítása
        $consumption = [
            'cold1' => $current['cold1'] - $prev['cold1'],
            'cold2' => $current['cold2'] - $prev['cold2'],
            'hot1' => $current['hot1'] - $prev['hot1'],
            'hot2' => $current['hot2'] - $prev['hot2'],
            'heating' => $current['heating'] - $prev['heating'],
        ];
    
        // Költségek kiszámítása
        $coldAmount = $settings['coldAmount'] ?? 0;
        $hotAmount = $settings['hotAmount'] ?? 0;
        $heatingAmount = $settings['heatingAmount'] ?? 0;
    
        // Összköltség visszatérítése
        return ($coldAmount * ($consumption['cold1'] + $consumption['cold2'])) +
               ($hotAmount * ($consumption['hot1'] + $consumption['hot2'])) +
               ($heatingAmount * $consumption['heating']);
    }
    

    private function getPreviousMetersValues($userId){

        //ellenőrzés hogy van-e két érték, azaz van-e már diktált adat
        try {
            $sql = "
                SELECT id, userId, mayId, cold1, cold2, hot1, hot2, heating
                FROM metersvalues
                WHERE userId = :userId
                ORDER BY mayId DESC
                LIMIT 2
            ";
            
            // PDO előkészítés és végrehajtás
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $stmt->execute();
    
            // Az eredmények visszaadása asszociatív tömbként
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            // Hibakezelés
            error_log("Hiba a lekérdezés során: " . $e->getMessage());
            return [];
        }
    }

     

        private function checkPrevValues($getPrevValues, $settings) {
            $values = [
                'cold1' => 0,
                'cold2' => 0,
                'hot1' => 0,
                'hot2' => 0,
                'heating' => 0,
            ];
        
            if (array_key_exists(1, $getPrevValues)) {
                if ($settings['cold1']) {
                    $values['cold1'] = $getPrevValues[1]['cold1'] ?? 0;
                }
                if ($settings['cold2']) {
                    $values['cold2'] = $getPrevValues[1]['cold2'] ?? 0;
                }
                if ($settings['hot1']) {
                    $values['hot1'] = $getPrevValues[1]['hot1'] ?? 0;
                }
                if ($settings['hot2']) {
                    $values['hot2'] = $getPrevValues[1]['hot2'] ?? 0;
                }
                if ($settings['heating']) {
                    $values['heating'] = $getPrevValues[1]['heating'] ?? 0;
                }
            }
        
            return $values;
        }
        
    

        private function calcSubDepCosts($settings, $residentData)
        {
            $options = [
                'perflat' => $residentData['subDeposit'],
                'fix' => $settings['subDepFix'] ?? 0,
                'smeter' => ($settings['subDepSmeter'] ?? 0) * $residentData['squareMeter']
            ];
        
            return $options[$settings['commonCost']] ?? 0;
        }
        
        private function calcExtraPayment($settings, $residentData)
        {
            if (empty($settings['extraPayment'])) return 0;
        
            $options = [
                'fix' => $settings['extraPayment'] ?? 0,
                'smeter' => ($settings['extraPayment'] ?? 0) * $residentData['squareMeter']
            ];
        
            return $options[$settings['extraPaymentMode']] ?? 0;
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

    public function getResidentData($userId, $settings)
{
    try {
        $sql = "
            SELECT 
                r.squareMeterId, 
                r.balance,
                r.isMeters,
                s.typeOfSquareMeters, 
                s.ccostForThis, 
                s.subDepForThis, 
                c.typeOfCommonCosts,
                sd.typeOfSubDeposits,
                u.email
            FROM 
                residents r
            JOIN 
                squaremeters s ON r.squareMeterId = s.id
            JOIN 
                commoncosts c ON s.ccostForThis = c.id
            LEFT JOIN 
                subdeposits sd ON s.subDepForThis = sd.id
            JOIN 
                users u ON r.userId = u.id
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
                'subDeposit' => ($settings['commonCost'] == 'perflat' ?? 0) ? $firstResident['typeOfSubDeposits'] : 0,
                'balance' => $firstResident['balance'],
                'email' => $firstResident['email'],
                'isMeters' => $firstResident['isMeters'],
            ];
        } else {
            return ['status' => 'error', 'message' => 'No resident data found'];
        }
        
    } catch (PDOException $e) {
        return ['status' => 'error', 'message' => $e->getMessage()];
    }
}


    private function getBankAccount(){
        $sql = "SELECT data FROM condodatas WHERE title = :title";
        $stmt = $this->conn->prepare($sql);
        $title = "Bankszámlaszám:";

    // Paraméter kötés
    $stmt->bindParam(':title', $title);

    // Lekérdezés végrehajtása
    $stmt->execute();

    // Eredmény lekérése
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        return $result['data'];
    } else {
        return null; // Ha nincs találat
    }
    }
}
