<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

include __DIR__ . '/../db_connect.php';

if (isset($_SESSION["user_logged"])) {
    echo json_encode(["status" => "already", "message" => "You are already logged in."]);
    exit;
}

$stmt = $const->prepare("SELECT user_id, user_email, user_password, user_description, user_img_path, user_type FROM users WHERE user_name = ?");
$stmt->bind_param("s", $_POST["user_name"]);
$stmt->execute();
$stmt->bind_result($user_id, $user_email, $user_password, $user_description, $user_img_path, $user_type);

if (!$stmt->fetch()) {
    echo json_encode(["status" => "fail", "message" => "Invalid username or password."]);
    exit;
}

if (!password_verify($_POST["user_password"], $user_password)) {
    echo json_encode(["status" => "fail", "message" => "Invalid username or password."]);
    exit;
}

session_regenerate_id(true);

$_SESSION["user_logged"] = true;
$_SESSION["user_id"] = $user_id;
$_SESSION["user_name"] = $_POST["user_name"];
$_SESSION["user_type"] = $user_type;
$_SESSION["user_typeof"] = ($user_type == 1) ? "Seller" : "Buyer";

if ($_SESSION["user_type"] == 1) {
    $_SESSION["user_typeof"] = "Seller";
} else {
    $_SESSION["user_typeof"] = "Buyer";
}

echo json_encode(["status" => "success", "message" => "Successfuly signed in."]);

?>