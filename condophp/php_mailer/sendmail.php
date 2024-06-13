<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';


if (isset($_POST['emailData'])) {
   
    $emailData = json_decode($_POST['emailData'], true);

    if ($emailData !== null) {
        
        $mail = new PHPMailer(true);
        $mail->CharSet = 'UTF-8'; 
        $mail->isSMTP();
        $mail->Host = 'mail.nethely.hu';  
        $mail->SMTPAuth = true;
        $mail->Username = 'admin@mycondo.hu'; 
        $mail->Password = 'Zombie80_1972';
        $mail->SMTPSecure = 'ssl';
        $mail->Port = 465;

        try {
            $mail->setFrom('admin@mycondo.hu', 'Társasház admin');
            $mail->addAddress($emailData['recipient'], $emailData['recipientName']);

            $mail->isHTML(true);
            $mail->Subject = $emailData['subject'];
            $mail->Body    = $emailData['message'];

            $mail->send();
            echo json_encode(['success' => true, 'message' => 'Az e-mail sikeresen elküldve!']);
        } catch (Exception $e) {
            // Hiba kezelése, ha valami nem sikerült
            echo json_encode(['success' => false, 'message' => 'Hiba történt az e-mail küldése közben: ' . $mail->ErrorInfo]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Hibás vagy hiányzó adatok!']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Hibás vagy hiányzó kérés!']);
}

?>
