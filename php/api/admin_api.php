<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");

// Mocking DB connection for now
$db = null; 

include_once '../models/Vendor.php';
include_once '../models/Order.php';
include_once '../models/Transaction.php';
include_once '../models/Withdrawal.php';

$vendor = new Vendor($db);
$order = new Order($db);
$transaction = new Transaction($db);
$withdrawal = new Withdrawal($db);

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action == 'dashboard') {
    // Mocking dashboard data
    $total_revenue = 12500.50;
    $total_vendors = 45;
    $total_orders = 1200;
    
    echo json_encode([
        "total_revenue" => $total_revenue,
        "total_vendors" => $total_vendors,
        "total_orders" => $total_orders
    ]);
} else if ($action == 'vendors') {
    $vendors = $vendor->readAll();
    echo json_encode($vendors);
} else if ($action == 'transactions') {
    $transactions = $transaction->readAll();
    echo json_encode($transactions);
} else if ($action == 'withdrawals') {
    $withdrawals = $withdrawal->readAll();
    echo json_encode($withdrawals);
} else if ($action == 'approve_withdrawal') {
    $id = isset($_GET['id']) ? $_GET['id'] : '';
    if (!empty($id)) {
        if ($withdrawal->approve($id)) {
            echo json_encode(["message" => "Withdrawal approved."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to approve withdrawal."]);
        }
    }
} else if ($action == 'set_otp_price') {
    $price = isset($_GET['price']) ? $_GET['price'] : '';
    if (!empty($price)) {
        // Update settings table
        $query = "UPDATE settings SET otp_price = ? WHERE id = 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(1, $price);
        if ($stmt->execute()) {
            echo json_encode(["message" => "OTP price updated."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update OTP price."]);
        }
    }
}
?>
