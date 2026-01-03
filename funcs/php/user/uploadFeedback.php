<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

if (!isset($_SESSION["user_logged"])) {
    echo json_encode(["status" => "unauthorized", "message" => "Please sign-in before submitting."]);
    exit;
}

$stmt = $const->prepare("INSERT INTO customer_feedbacks (user_id, feedback_message, feedback_rating) VALUES (?, ?, ?)");
$stmt->bind_param("isi", $_SESSION["user_id"], $_POST["feedback_message"], $_POST["feedback_rating"]);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Feedback submitted successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => "Error feedback on database: " . $stmt->error]);
}
?>