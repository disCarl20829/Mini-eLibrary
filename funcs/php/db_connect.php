<?php
$host = "localhost";
$dbuser = "root";
$dbpass = "";
$db = "elibrary";

$const = new mysqli($host, $dbuser, $dbpass, $db);
if ($const->connect_error) {
    die("Connection failed: " . $const->connect_error);
}
?>