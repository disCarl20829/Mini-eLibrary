<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

$stmt = $const->prepare("SELECT * FROM book_category");

?>