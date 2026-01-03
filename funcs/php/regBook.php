<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

$host = "localhost";
$dbuser = "root";
$dbpass = "";
$db = "elibrary";

$data = json_decode(file_get_contents("php://input"), true);
$userID = $_SESSION['userID'] ?? 1;
$bookID = $data['id'];
$quantity = $data['quantity'];

$conn = new mysqli($host, $dbuser, $dbpass, $db);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$stmt = $conn->prepare("INSERT INTO cart (userID, bookID, quantity) VALUES (?, ?, ?)");
$stmt->bind_param("iii", $userID, $bookID, $quantity);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Book was added successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => "Error registering book: " . $stmt->error]);
}

?>