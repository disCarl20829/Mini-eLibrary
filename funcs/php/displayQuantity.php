<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/db_connect.php';

if (!isset($_SESSION["user_logged"])) {
    echo json_encode(["status" => "unauthorized", "message" => "User is not logged in."]);
    exit;
}

$user_id = $_SESSION["user_id"] ?? 1;
$book_id = $_GET["book_id"];

$stmt = $const->prepare("SELECT save_quantity FROM save_books WHERE user_id = ? AND book_id = ?");
$stmt->bind_param("ii", $user_id, $book_id);

$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode(["status" => "exists", "save_quantity" => $row["save_quantity"]]);
} else {
    echo json_encode(["status" => "none"]);
}

?>