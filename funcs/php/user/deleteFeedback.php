<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

$stmt = $const->prepare("DELETE FROM customer_feedbacks WHERE feedback_id = ?");
$stmt->bind_param("i", $_POST['feedback_id']);

if (!$stmt->execute()) {
    echo json_encode(["status" => "error", "message" => "Error on feedback deletion: " . $stmt->error]);
    exit;
}

echo json_encode(["status" => "success", "message" => "Successfully deleted feedback."]);

?>