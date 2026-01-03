<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

if (!isset($_SESSION["user_logged"])) {
    echo json_encode(["status" => "unauthorized", "message" => "User is not logged in."]);
}

$stmt = $const->prepare("UPDATE customer_feedbacks SET feedback_message = ?, feedback_rating = ? WHERE feedback_id = ?");
$stmt->bind_param("sii", $_POST["feedback_message"], $_POST["feedback_rating"], $_POST["feedback_id"]);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Feedback changed successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error changing feedback: " . $stmt->error]);
    exit;
}
?>