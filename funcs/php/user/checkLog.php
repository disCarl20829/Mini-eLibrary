<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

if (isset($_SESSION["user_logged"])) {
    echo json_encode(["logged" => true, "message" => "You are logged in.", "user_id" => $_SESSION["user_id"], "user_name" => $_SESSION["user_name"], "user_type" => $_SESSION["user_typeof"]]);
} else {
    echo json_encode(["logged" => false, "message" => "User is not logged in."]);
}

?>