<?php

require '../config/header.php';

class SetResidences
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

}