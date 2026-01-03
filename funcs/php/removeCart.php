<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/db_connect.php';

$user_id = $_SESSION["user_id"] ?? 1;
$book_id = $_GET["book_id"];

$stmt = $const->prepare("DELETE FROM save_books WHERE book_id = ? and user_id = ?");
$stmt->bind_param("ii", $book_id, $user_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Successfully deleted book."]);
} else {
    echo json_encode(["status" => "error", "message" => "Error on book removal: " . $stmt->error]);
    exit;
}

?>