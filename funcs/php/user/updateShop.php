<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

if (!isset($_SESSION["user_logged"])) {
    echo json_encode(["status" => "unauthorized", "message" => "Either user is not logged or not the owner."]);
    exit;
}

if (isset($_FILES['shop_img_path'])) {
    $image = $_FILES['shop_img_path'];

    $uploadDir = "shop/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = time() . "_" . basename($image["name"]);
    $filePath = $uploadDir . $fileName;

    if (!move_uploaded_file($image["tmp_name"], $filePath)) {
        echo json_encode(["status" => "error", "message" => "Failed to upload image."]);
        exit;
    }

    $user_img_path = "funcs/php/user/shop/" . $fileName;
} else {
    $user_img_path = "";
}


$stmt = $const->prepare("UPDATE shop SET shop_img_path = ?, shop_owner = ?, shop_history = ?, shop_vision = ?, shop_mission = ? WHERE shop_id = ?");
$stmt->bind_param("sssssi", $user_img_path, $_POST["shop_owner"], $_POST["shop_history"], $_POST["shop_vision"], $_POST["shop_mission"], $_SESSION["user_id"]);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Shop information changed successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error changing shop information: " . $stmt->error]);
    exit;
}
?>