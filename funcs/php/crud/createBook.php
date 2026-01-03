<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

if (isset($_FILES['book_img_path'])) {
    $image = $_FILES['book_img_path'];

    $uploadDir = "books/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = time() . "_" . basename($image["name"]);
    $filePath = $uploadDir . $fileName;
    // /book/123123123_Nolimitang.png

    if (!move_uploaded_file($image["tmp_name"], $filePath)) {
        echo json_encode(["status" => "error", "message" => "Failed to upload image."]);
        exit;
    }

    $dbFilePath = "funcs/php/crud/books/" . $fileName;
} else {
    echo json_encode(["status" => "error", "message" => "No image uploaded."]);
    exit;
}

$stmt = $const->prepare("INSERT INTO books (book_title, book_author, book_pubdate, book_description, book_price, book_img_path) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssds", $_POST['book_title'], $_POST['book_author'], $_POST['book_pubdate'], $_POST['book_description'], $_POST['book_price'], $dbFilePath);

if (!$stmt->execute()) {
    echo json_encode(["status" => "error", "message" => "Error registering book: " . $stmt->error]);
    exit;
}

$book_id = $stmt->insert_id; //28
$category_id = $_POST["book_category"]; //2

$stmt2 = $const->prepare("INSERT INTO book_category (category_id, book_id) VALUES (?, ?)");
$stmt2->bind_param("ii", $category_id, $book_id);

if (!$stmt2->execute()) {
    echo json_encode(["status" => "error", "message" => "Error linking book to category: " . $stmt2->error]);
    exit;
}

echo json_encode(["status" => "success", "message" => "Book was added successfully."]);
?>