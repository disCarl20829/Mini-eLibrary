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

$stmt = $const->prepare("SELECT t1.shop_owner, t1.shop_history, t1.shop_mission, t1.shop_vision, t1.shop_img_path, t2.user_description, t2.user_type FROM shop AS t1 JOIN users AS t2 ON t1.shop_id = t2.user_id WHERE t2.user_id = ?");
$stmt->bind_param("i", $_SESSION["user_id"]);

$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $row["is_owner"] = true;
        echo json_encode(["status" => "success", "data" => $row]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Retrieving profile: " . $stmt->error]);
}
?>