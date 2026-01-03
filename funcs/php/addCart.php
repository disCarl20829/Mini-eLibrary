<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/db_connect.php';

if (!isset($_SESSION["user_logged"])) {
    echo json_encode(["status" => "unauthorized", "message" => "User is not logged in."]);
    exit;
}

$book_id = $_POST["book_id"];
$user_id = $_SESSION["user_id"];
$save_quantity = $_POST["save_quantity"];
    
$check = $const->prepare("SELECT save_quantity FROM save_books WHERE user_id = ? AND book_id = ?");
$check->bind_param("ii", $user_id, $book_id);
$check->execute();
$result = $check->get_result();

if ($result->num_rows > 0) {
    $update = $const->prepare("UPDATE save_books SET save_quantity = ? WHERE user_id = ? AND book_id = ?");
    $update->bind_param("iii", $save_quantity, $user_id, $book_id);

    if ($update->execute()) {
        echo json_encode(["status" => "updated"]);
    } else {
        echo json_encode(["status" => "error", "message" => $update->error]);
    }
} else {
    $stmt = $const->prepare("INSERT INTO save_books (user_id, book_id, save_quantity) VALUES (?, ?, ?)");
    $stmt->bind_param("iii",  $user_id, $book_id, $save_quantity);

    if ($stmt->execute()) {
        echo json_encode(["status" => "inserted"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
}
?>