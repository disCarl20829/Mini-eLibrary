<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

if (!empty($_POST['book_img_path'])) {
    $imgPath = basename($_POST['book_img_path']);
    $realName = __DIR__ . "/books/" . $imgPath;

    if (file_exists($realName) && is_file($realName)) {
        if (!unlink($realName)) {
            echo json_encode([
                "status" => "error",
                "message" => "Failed to delete image."
            ]);
            exit;
        }
    }
}

$stmt = $const->prepare("DELETE FROM books WHERE book_id = ?");
$stmt->bind_param("i", $_POST['book_id']);

if (!$stmt->execute()) {
    echo json_encode(["status" => "error", "message" => "Error on book deletion: " . $stmt->error]);
    exit;
}

$stmt2 = $const->prepare("DELETE FROM book_category WHERE book_id = ?");
$stmt2->bind_param("i", $_POST['book_id']);

if (!$stmt2->execute()) {
    echo json_encode(["status" => "error", "message" => "Error on book category deletion: " . $stmt2->error]);
    exit;
}

echo json_encode(["status" => "success", "message" => "Successfully deleted book"]);
