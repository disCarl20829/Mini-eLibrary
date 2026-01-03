<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

$stmt = $const->prepare("SELECT t1.book_id, t1.book_title, t1.book_author, t1.book_pubdate, t1.book_price, t1.book_description, t1.book_img_path, t2.category_id FROM books AS t1 JOIN book_category AS t2 ON t1.book_id = t2.book_id ORDER BY t1.book_id");

if ($stmt->execute()) {
    $result = $stmt->get_result();
    $books = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode(["status" => "success", "data" => $books]);
} else {
    echo json_encode(["status" => "error", "message" => "Retrieving books: " . $stmt->error]);
}

?>