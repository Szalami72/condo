<?php

// PHPMailer betöltése
require '../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailSender
{
    private $mailer;

    public function __construct()
    {
        $this->mailer = new PHPMailer(true);
        $this->configureSMTP();
    }

    public function sendEmail($email, $mayId, $htmlEmailContent)
    {
        try {
            // Email beállítások
            $this->mailer->setFrom('admin@mycondo.hu', 'MyCondo.hu');
            $this->mailer->addAddress($email);
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Fizetendő rezsi, ' . $mayId;
            $this->mailer->Body = $htmlEmailContent;
            $this->mailer->AltBody = '';

            // Email küldése
            $this->mailer->send();
            return true;
        } catch (Exception $e) {
            error_log("Email could not be sent. Mailer Error: {$this->mailer->ErrorInfo}");
            return false;
        }
    }

    private function configureSMTP()
    {
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
}

