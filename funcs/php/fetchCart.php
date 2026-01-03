<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/db_connect.php';

if (!isset($_SESSION["user_logged"])) {
    echo json_encode(["status" => "unauthorized", "message" => "User is not logged in."]);
    exit;
}

$user_id = $_SESSION["user_id"] ?? 1; //$_SESSION["user_id"];

$stmt = $const->prepare("SELECT t1.book_id, t1.book_title, t1.book_author, t1.book_img_path, t1.book_price, t2.save_quantity FROM save_books AS t2 JOIN books AS t1 ON t2.book_id = t1.book_id WHERE t2.user_id = ?");
$stmt->bind_param("i", $user_id);

$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode(["status" => "exists", "data" => $row]);
} else {
    echo json_encode(["status" => "none"]);
}

?>