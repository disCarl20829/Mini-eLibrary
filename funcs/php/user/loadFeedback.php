<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

$stmt = $const->prepare("SELECT t1.feedback_id, t1.feedback_message, t1.feedback_rating, t1.feedback_date, t2.user_name, t2.user_img_path, t2.user_id FROM customer_feedbacks AS t1 JOIN users AS t2 ON t1.user_id = t2.user_id ORDER BY t1.feedback_date DESC");

$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $row["is_owner"] = isset($_SESSION["user_id"]) && $_SESSION["user_id"] == $row["user_id"];
        $feedbacks[] = $row;
    }

    echo json_encode(["status" => "success", "data" => $feedbacks]);
} else {
    echo json_encode(["status" => "error", "message" => "Retrieving feedback: " . $stmt->error]);
}
?>