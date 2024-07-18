<?php

require '../config/header.php';

class DeleteResident {
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function fetchResidents()
    {

    }
}