<?php

require '../config/header.php';

class GetResidences
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

}
