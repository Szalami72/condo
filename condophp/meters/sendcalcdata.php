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

    public function generate($data){

        $metersValueCosts = 0;
        $commoncost = 0;
        $extraCosts = 0;
        $allCosts = 0;

        $header = "<html>
        <head>
            <title>{$data['mayId']} havi kalkuláció</title>
        </head>
        <body>
            <h2>{$data["mayId"]} havi kalkuláció</h2>";

//tableMeters kezdete
        $tableMeters = "
        <p>A leadott óraállások alapján a havi fizetendő összeg:</p>
        <table border='1' cellpadding='5'>
                <tr>
                    <th>Mérőóra</th>
                    <th>Óraállás</th>
                    <th>Egységár</th>
                </tr>";

        if($data['cold1'] > 0){

            $metersValueCosts += $data['cold1Value'] * $data['coldAmount'];
            $tableMeters .= "<tr>
                <td>Hideg 1</td>
                <td style='text-align: right;'>{$data['cold1Value']} m<sup>3</sup></td>
                <td style='text-align: right;'>{$data['coldAmount']} Ft</td>
                
            </tr>";
        }

        if($data['cold2'] > 0){

            $metersValueCosts += $data['cold2Value'] * $data['coldAmount'];
            $tableMeters .= "<tr>
                <td>Hideg 2</td>
                <td style='text-align: right;'>{$data['cold2Value']} m<sup>3</sup></td>
                <td style='text-align: right;'>{$data['coldAmount']} Ft</td>
            </tr>";
        }

        if($data['hot1'] > 0){

            $metersValueCosts += $data['hot1Value'] * $data['hotAmount'];
            $tableMeters .= "<tr>
                <td>Meleg 1</td>
                <td style='text-align: right;'>{$data['hot1Value']} m<sup>3</sup></td>
                <td style='text-align: right;'>{$data['hotAmount']} Ft</td>
            </tr>";
        }

        if($data['hot2'] > 0){

            $metersValueCosts += $data['hot2Value'] * $data['hotAmount'];
            $tableMeters .= "<tr>
                <td>Meleg 2</td>
                <td style='text-align: right;'>{$data['hot2Value']} m<sup>3</sup></td>
                <td style='text-align: right;'>{$data['hotAmount']} Ft</td>
            </tr>";
        }

        if($data['heating'] > 0){

            $metersValueCosts += $data['heatingValue'] * $data['heatingAmount'];
            $tableMeters .= "<tr>
                <td>Hőmennyiség</td>
                <td style='text-align: right;'>{$data['heatingValue']} egység</td>
                <td style='text-align: right;'>{$data['heatingAmount']} Ft</td>
            </tr>";
        }

        $allCosts = $metersValueCosts;

        $tableMeters .= "<tr>
             <td colspan='2' style='text-align: left;'><b>Óraállások összesen:</b></td>
             <td style='text-align: right; color: #007bff;'><b>{$metersValueCosts} Ft</b></td>";
             
        $tableMeters .= "</table>";
//tableMeters vége

//tableCosts kezdete
        $tableCosts = "
        <br>
        <p>Közös költség:</p>
        <table border='1' cellpadding='5'>";
        
        switch ($data['commonCost']) {

            case 'fix':
                $commoncost = $data['amountFix'];
                $tableCosts .= "<tr>
                    <th>Közös költség</th>
                    <th style='text-align: right; color: #007bff;'>{$data['amountFix']} Ft</th>
                </tr>";
                $allCosts += $data['amountFix'];
                break;

            case 'smeter':
                $commoncost = $data['amountSmeter'] * $data['squareMeter'];
                $tableCosts .= "<tr>
                    <th>Négyzetméter</th>
                    <th>Ft/m<sup>2</sup></th>
                    <th>Összesen</th>
                </tr>
                <tr>
                    <td style='text-align: right;'>{$data['squareMeter']}</td>
                    <td style='text-align: right;'>{$data['amountSmeter']}</td>
                    <td style='text-align: right; color: #007bff;'><b>{$commoncost} Ft</b></td>
                </tr>";
                $allCosts += $commoncost;
                break;

            case 'perflat':
                $commoncost = $data['commonCost'];
                $tableCosts .= "<tr>
                    <th>Közös költség</th>
                    <th style='text-align: right; color: #007bff;'>{$data['ccost']} Ft</th>
                </tr>";
                $allCosts += $data['ccost'];
                break;
        }

        $tableCosts .= "<table>";

//tableCosts vége

//tableSubDep
        $tableSubDep = "";
        if($data['subDeposit'] > 0){
            $tableSubDep = "<br>
        <p>Albetéti díj /nincs vízóra/:</p>
        <table border='1' cellpadding='5'>";
        
            if($data['subDepFix'] > 0){
                $tableSubDep .= "<tr>
                    <th>Albetéti díj</th>
                    <th style='text-align: right; color: #007bff;'>{$data['subDepFix']} Ft</th>
                </tr>";
                $allCosts += $data['subDepFix'];
            }
            if($data['subDepSmeter'] > 0){
                $subDep = $data['subDepSmeter'] * $data['squareMeter'];
                $tableSubDep .= "<tr>
                    <th>Négyzetméter</th>
                    <th>Ft/m<sup>2</sup></th>
                    <th>Összesen</th>
                </tr>
                <tr>
                    <td style='text-align: right;'>{$data['squareMeter']}</td>
                    <td style='text-align: right;'>{$data['subDepSmeter']}</td>
                    <td style='text-align: right; color: #007bff;'><b>{$subDep} Ft</b></td>
                </tr>";
                $allCosts += $subDep;
            }

            $tableSubDep .= "</table>";
        }
//tableSubDep vége

//tableExtraCosts kezdete
        $tableExtraPay = "";
        if($data['extraPayment'] > 0){
            $tableExtraPay = "<br>
        <p>Plusz befizetés:</p>
        <table border='1' cellpadding='5'>
            <tr>
                <th>Befizetés oka</th>
                <th>Befizetés módja</th>
                <th>Összeg</th>
            </tr>";

            if($data['extraPaymentMode'] == 'fix'){
                $tableExtraPay .= "<tr>
                    <td> {$data['extraPaymentTitle']} Ft</td>
                    <td style='text-align: right;'>Fix összeg</td>
                    <td style='text-align: right;'>{$data['extraPayment']} Ft</td>
                </tr>";

                $allCosts += $data['extraPayment'];
            }

            if($data['extraPaymentMode'] == 'squaremeter'){
                $tableExtraPay .= "<tr>
                    <td  style='max-width:150px; width:150px; word-wrap:break-word;'> {$data['extraPaymentTitle']}</td>
                    <td style='text-align: right;'>Ft/m<sup>2</sup></td>
                    <td style='text-align: right; color: #007bff;'>{$data['extraPayment']} Ft</td>
                </tr>";

                $allCosts += $data['extraPayment'] * $data['squareMeter'];
            }

            $tableExtraPay .= "</table>";
        }
            

//tableExtraCosts vége

        $footer = '
        <br>
        <hr>
        <p style="font-weight: bold; display: inline">Összes költség:</p>
        <p style="font-weight: bold; color: #007bff; display: inline">' . $allCosts . ' Ft</p>
        <hr>
        <br>
        </body>
        </html>';

        $htmlEmailContent = $header . $tableMeters . $tableCosts . $tableSubDep . $tableExtraPay . $footer;

    
        return json_encode([
            'status' => 'success',
            'emailContent' => $htmlEmailContent
        ]);
        return $data;
    }
}