<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

if (isset($_SESSION["user_logged"])) {
    exit;
}

if (isset($_FILES['user_img_path'])) {
    $image = $_FILES['user_img_path'];

    $uploadDir = "profile/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = time() . "_" . basename($image["name"]);
    $filePath = $uploadDir . $fileName;

    if (!move_uploaded_file($image["tmp_name"], $filePath)) {
        echo json_encode(["status" => "error", "message" => "Failed to upload image."]);
        exit;
    }

    $user_img_path = "funcs/php/user/profile/" . $fileName;
} else {
    echo json_encode(["status" => "error", "message" => "No image uploaded."]);
    exit;
}

$hashedPassword = password_hash($_POST["user_password"], PASSWORD_DEFAULT);

$match = $const->prepare("SELECT user_name FROM users WHERE user_name = ?");
$match->bind_param("s", $_POST["user_name"]);

$match->execute();
$hasMatch = $match->get_result();

if ($hasMatch->num_rows > 0) {
    echo json_encode(["status" => "matching", "message" => "Username already exists."]);
    exit;
}

$stmt = $const->prepare(("INSERT INTO users (user_name, user_email, user_password, user_img_path, user_type) VALUES (?, ?, ?, ?, ?)"));
$stmt->bind_param("ssssi", $_POST["user_name"], $_POST["user_email"], $hashedPassword, $user_img_path, $_POST["user_type"]);

if (!$stmt->execute()) {
    echo json_encode(["status" => "failed", "message" => "Account creation failed."]);
    exit;
}

$stmt2 = $const->prepare(("INSERT INTO shop (shop_owner) VALUES (?)"));
$stmt2->bind_param("s", $_POST["user_name"]);

if (!$stmt2->execute()) {
    echo json_encode(["status" => "failed", "message" => "Shop failed."]);
    exit;
}

 echo json_encode(["status" => "created", "message" => "User created"]);

?>