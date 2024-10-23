<?php

require '../vendor/autoload.php';
require '../config/header.php';

use PHPMailer\PHPMailer\PHPMailer;

class SendCalcData
{
    private $conn;
    private $mailer;

    public function __construct($conn) {
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
    }


public function generate($data) {
    $metersValueCosts = $this->calculateMeterCosts($data);
    $subDepCosts = $this->calculateSubDepCosts($data);

    $commoncost = $this->calculateCommonCosts($data);
    $extraCosts = $this->calculateExtraCosts($data);

    $allCosts = $metersValueCosts + $commoncost + $subDepCosts + $extraCosts;

    $header = $this->generateHeader($data);
    $tableMeters = $this->generateMeterTable($data, $metersValueCosts);
    $tableSubDep = $this->generateSubDepTable($data);
    $tableCosts = $this->generateCostTable($data, $commoncost);
    $tableExtraPay = $this->generateExtraPayTable($data, $extraCosts);
    $footer = $this->generateFooter($allCosts, $data['bankAccount']);

    $htmlEmailContent = $header . $tableMeters . $tableCosts . $tableSubDep . $tableExtraPay . $footer;

    $this->sendEmail($data['email'], $data['mayId'], $htmlEmailContent);

    return json_encode([
        'status' => 'success',
        'emailContent' => $htmlEmailContent
    ]);
}

private function calculateMeterCosts($data) {
    // Kiszámítja az óraállás alapú költségeket
    $metersValueCosts = 0;
    if ($data['cold1'] > 0) {
        $metersValueCosts += $data['cold1Value'] * $data['coldAmount'];
    }
    if ($data['cold2'] > 0) {
        $metersValueCosts += $data['cold2Value'] * $data['coldAmount'];
    }
    if ($data['hot1'] > 0) {
        $metersValueCosts += $data['hot1Value'] * $data['hotAmount'];
    }
    if ($data['hot2'] > 0) {
        $metersValueCosts += $data['hot2Value'] * $data['hotAmount'];
    }
    if ($data['heating'] > 0) {
        $metersValueCosts += $data['heatingValue'] * $data['heatingAmount'];
    }
    return $metersValueCosts;
}

private function calculateCommonCosts($data) {
    if ($data['isMeters'] == 0) return 0;
    // Kiszámítja a közös költségeket
    $commoncost = 0;
    if ($data['commonCost'] === 'fix') {
        $commoncost = $data['amountFix'];
    } elseif ($data['commonCost'] === 'smeter') {
        $commoncost = $data['amountSmeter'] * $data['squareMeter'];
    } elseif ($data['commonCost'] === 'perflat') {
        $commoncost = $data['ccost'];
    }
    return $commoncost;
}

private function calculateSubDepCosts($data) {
    // Kiszámítja a költség alapján a költségeket
    if($data['isMeters'] > 0) return 0; 
    $subDepCosts = 0;
    if ($data['subDepFix'] > 0) {
        $subDepCosts += $data['subDepFix'];
    }
    if ($data['subDepSmeter'] > 0) {
        $subDepCosts += $data['subDepSmeter'] * $data['squareMeter'];
    }
    return $subDepCosts;
}
private function calculateExtraCosts($data) {
    // Kiszámítja az extra befizetéseket
    $extraCosts = 0;
    if ($data['extraPaymentMode'] === 'fix') {
        $extraCosts = $data['extraPayment'];
    } elseif ($data['extraPaymentMode'] === 'squaremeter') {
        $extraCosts = $data['extraPayment'] * $data['squareMeter'];
    }
    return $extraCosts;
}

private function generateHeader($data) {
    return "<html><head><title>{$data['mayId']} havi kalkuláció</title></head><body><h2>{$data['mayId']} havi kalkuláció</h2>";
}

private function generateMeterTable($data, $metersValueCosts) {
    $table = "
    <p>A leadott óraállások alapján a havi fizetendő összeg:</p>
    <table border='1' cellpadding='5'>
        <tr>
            <th>Mérőóra</th>
            <th>Óraállás</th>
            <th>Egységár</th>
        </tr>";

    if ($data['cold1'] > 0) {
        $table .= "<tr>
            <td>Hideg 1</td>
            <td style='text-align: right;'>{$data['cold1Value']} m<sup>3</sup></td>
            <td style='text-align: right;'>{$data['coldAmount']} Ft</td>
        </tr>";
    }

    if ($data['cold2'] > 0) {
        $table .= "<tr>
            <td>Hideg 2</td>
            <td style='text-align: right;'>{$data['cold2Value']} m<sup>3</sup></td>
            <td style='text-align: right;'>{$data['coldAmount']} Ft</td>
        </tr>";
    }

    if ($data['hot1'] > 0) {
        $table .= "<tr>
            <td>Meleg 1</td>
            <td style='text-align: right;'>{$data['hot1Value']} m<sup>3</sup></td>
            <td style='text-align: right;'>{$data['hotAmount']} Ft</td>
        </tr>";
    }

    if ($data['hot2'] > 0) {
        $table .= "<tr>
            <td>Meleg 2</td>
            <td style='text-align: right;'>{$data['hot2Value']} m<sup>3</sup></td>
            <td style='text-align: right;'>{$data['hotAmount']} Ft</td>
        </tr>";
    }

    if ($data['heating'] > 0) {
        $table .= "<tr>
            <td>Hőmennyiség</td>
            <td style='text-align: right;'>{$data['heatingValue']} egység</td>
            <td style='text-align: right;'>{$data['heatingAmount']} Ft</td>
        </tr>";
    }

    $table .= "<tr>
             <td colspan='2' style='text-align: left;'><b>Óraállások összesen:</b></td>
             <td style='text-align: right; color: #007bff;'><b>{$metersValueCosts} Ft</b></td>";

    $table .= "</table>";
    return $table;
}

private function generateCostTable($data, $commoncost) {
    if (!$data['isMeters']) return '';

    $table = "<br><p>Közös költség:</p><table border='1' cellpadding='5'>";

    if ($data['commonCost'] === 'fix' || $data['commonCost'] === 'perflat') {
        $table .= "<tr>
            <th>Közös költség</th>
            <th style='text-align: right; color: #007bff;'>{$commoncost} Ft</th>
        </tr>";
    } elseif ($data['commonCost'] === 'smeter') {
        $table .= "<tr>
            <th>Négyzetméter</th>
            <th>Ft/m<sup>2</sup></th>
            <th>Összesen</th>
        </tr>
        <tr>
            <td style='text-align: right;'>{$data['squareMeter']}</td>
            <td style='text-align: right;'>{$data['amountSmeter']}</td>
            <td style='text-align: right; color: #007bff;'><b>{$commoncost} Ft</b></td>
        </tr>";

    }
    $table .= "</table>";
    return $table;
    
}

private function generateSubDepTable($data) {
    if ($data['isMeters']) return '';

    $table = "<br><p>Albetéti díj /nincs vízóra/:</p><table border='1' cellpadding='5'>";

    if ($data['subDepFix'] > 0) {
        $table .= "<tr>
            <th>Albetéti díj</th>
            <th style='text-align: right; color: #007bff;'>{$data['subDepFix']} Ft</th>
        </tr>";
    }

    if ($data['subDepSmeter'] > 0) {
        $subDep = $data['subDepSmeter'] * $data['squareMeter'];
        $table .= "<tr>
            <th>Négyzetméter</th>
            <th>Ft/m<sup>2</sup></th>
            <th>Összesen</th>
        </tr>
        <tr>
            <td style='text-align: right;'>{$data['squareMeter']}</td>
            <td style='text-align: right;'>{$data['subDepSmeter']}</td>
            <td style='text-align: right; color: #007bff;'><b>{$subDep} Ft</b></td>
        </tr>";
    }

    $table .= "</table>";
    return $table;
}

private function generateExtraPayTable($data, $extraCosts) {
    if ($data['extraPayment'] <= 0) return '';

    $table = "<br><p>Extra befizetések:</p><table border='1' cellpadding='5'>
                <tr>
                <th>Befizetés oka</th>
                <th>Befizetés módja</th>
                <th>Összeg</th>
            </tr>";

    if ($data['extraPaymentMode'] === 'fix') {
        $table .= "<tr>
                    <td style='max-width:150px; width:150px; word-wrap:break-word;'> {$data['extraPaymentTitle']}</td>
                    <td style='text-align: right;'>Fix összeg</td>
                    <td style='text-align: right;'>{$extraCosts} Ft</td>
                </tr>";


    } elseif ($data['extraPaymentMode'] === 'squaremeter') {
        $table .= "<tr>
                    <td  style='max-width:150px; width:150px; word-wrap:break-word;'> {$data['extraPaymentTitle']}</td>
                    <td style='text-align: right;'>{$data['extraPayment']} Ft/m<sup>2</sup></td>
                    <td style='text-align: right; color: #007bff;'>{$extraCosts} Ft</td>
                </tr>";
    }

    $table .= "</table>";
    return $table;
}

private function generateFooter($totalCost, $bankAccount) {
    return "<br>
        <hr>
        <p style='font-weight: bold; display: inline'>Összes költség: </p>
        <p style='font-weight: bold; color: #007bff; display: inline'>" . $totalCost . " Ft</p>
        <hr>
        <p>Kérem az összeg befizetését a következő számlaszámra:</p>
        <p style='font-weight: bold; color: #007bff;'>" . $bankAccount . "</p>
        <br>
        </body>
        </html>";
}

private function sendEmail($email, $mayId, $htmlEmailContent) {
    try {
    
        // Email beállítások
        $this->mailer->setFrom('admin@mycondo.hu', 'MyCondo.hu');
        $this->mailer->addAddress($email);
        $this->mailer->isHTML(true);
        $this->mailer->Subject = 'Fizetendő rezsi, ' . $mayId;
        $this->mailer->Body    =  $htmlEmailContent;
        $this->mailer->AltBody = "";
        //$this->mailer->SMTPDebug = 2;  // 1 - csak üzenetek, 2 - teljes debug


        $this->mailer->send();
    } catch (Exception $e) {
        error_log("Email could not be sent. Mailer Error: {$this->mailer->ErrorInfo}");
    }
}

}
