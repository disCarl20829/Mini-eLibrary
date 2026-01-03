<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

/*
if (!isset($_SESSION["user_logged"])) {
    echo json_encode(["status" => "unauthorized", "message" => "Please sign-in to continue"]);
    exit;
}
*/

$stmt = $const->prepare("SELECT user_name, user_email, user_password, user_description, user_img_path, user_type FROM users WHERE user_id = ?");
$stmt->bind_param("i", $_SESSION["user_id"]);

$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["status" => "retrieved", "message" => "Successfully retrieved", "data" => $result->fetch_assoc()]);
} else {
    echo json_encode(["status" => "error", "message" => "Retrieving profile: " . $stmt->error]);
}
?>