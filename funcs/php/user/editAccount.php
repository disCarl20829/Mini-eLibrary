<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["status" => "unauthorized", "message" => "Please sign in to continue."]);
    exit;
}

$user_id = $_SESSION["user_id"];

$stmt = $const->prepare("SELECT user_name, user_email, user_password, user_img_path FROM users WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$currentData = $stmt->get_result()->fetch_assoc();

if (isset($_FILES['user_img_path']) && $_FILES['user_img_path']['tmp_name'] != "") {
    $image = $_FILES['user_img_path'];

    $oldFile = __DIR__ . "/profile/" . basename($currentData['user_img_path']);
    if (file_exists($oldFile)) unlink($oldFile);

    $uploadDir = "profile/";
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    $fileName = time() . "_" . basename($image["name"]);
    $filePath = $uploadDir . $fileName;

    if (!move_uploaded_file($image["tmp_name"], $filePath)) {
        echo json_encode(["status" => "error", "message" => "Failed to upload image."]);
        exit;
    }

    $user_img_path = "funcs/php/user/profile/" . $fileName;
} else {
    $user_img_path = $currentData['user_img_path'];
}

if (!empty($_POST['user_name']) && $_POST['user_name'] !== $currentData['user_name']) {
    $match = $const->prepare("SELECT user_id FROM users WHERE user_name = ? AND user_id != ?");
    $match->bind_param("si", $_POST["user_name"], $user_id);
    $match->execute();
    if ($match->get_result()->num_rows > 0) {
        echo json_encode(["status" => "matching", "message" => "Username already exists."]);
        exit;
    }
    $user_name = $_POST['user_name'];
} else {
    $user_name = $currentData['user_name'];
}

$user_email = !empty($_POST['user_email']) ? $_POST['user_email'] : $currentData['user_email'];

if (!empty($_POST['user_password'])) {
    $user_password = password_hash($_POST['user_password'], PASSWORD_DEFAULT);
} else {
    $user_password = $currentData['user_password'];
}

$stmt = $const->prepare("UPDATE users SET user_name = ?, user_email = ?, user_password = ?, user_img_path = ? WHERE user_id = ?");
$stmt->bind_param("ssssi", $user_name, $user_email, $user_password, $user_img_path, $user_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "updated", "message" => "Account successfully updated."]);
} else {
    echo json_encode(["status" => "error", "message" => "Update failed: " . $stmt->error]);
}
?>
