<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

if (isset($_FILES['book_img_path'])) {
    $image = $_FILES['book_img_path'];

    $oldFile = __DIR__ . "/books/" . basename($_POST['old_book_img_path']);

    if (file_exists($oldFile)) {
        unlink($oldFile);
    }

    $uploadDir = "books/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = time() . "_" . basename($image["name"]);
    $filePath = $uploadDir . $fileName;

    if (!move_uploaded_file($image["tmp_name"], $filePath)) {
        echo json_encode(["status" => "error", "message" => "Failed to upload image."]);
        exit;
    }

    $dbFilePath = "funcs/php/crud/books/" . $fileName;
} else {
    $dbFilePath = $_POST['old_book_img_path'];
}

$book_id = $_POST['book_id'];

$stmt = $const->prepare("UPDATE books SET book_title = ?, book_author = ?, book_pubdate = ?, book_description = ?, book_price = ?, book_img_path = ? WHERE book_id = ?");
$stmt->bind_param("ssssdsi", $_POST['book_title'], $_POST['book_author'], $_POST['book_pubdate'], $_POST['book_description'], $_POST['book_price'], $dbFilePath, $book_id);

if (!$stmt->execute()) {
    echo json_encode(["status" => "error", "message" => "Error updating book: " . $stmt->error]);
    exit;
}

$category_id = $_POST["book_category"];

$stmt2 = $const->prepare("UPDATE book_category SET category_id = ? WHERE book_id = ?");
$stmt2->bind_param("ii", $category_id, $book_id);

if (!$stmt2->execute()) {
    echo json_encode(["status" => "error", "message" => "Error updating book category: " . $stmt2->error]);
    exit;
}

echo json_encode(["status" => "success", "message" => "Book was updated successfully."]);
?>