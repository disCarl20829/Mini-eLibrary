<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

echo json_encode(["status" => "success", "message" => "Successfuly logged out."]);

session_destroy();
exit;
?>