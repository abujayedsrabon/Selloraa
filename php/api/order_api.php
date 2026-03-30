<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");

// Mocking DB connection for now
$db = null; 

include_once '../models/Order.php';
include_once '../models/Vendor.php';
include_once '../models/Transaction.php';

$order = new Order($db);
$vendor = new Vendor($db);
$transaction = new Transaction($db);

$data = json_decode(file_get_contents("php://input"));

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action == 'place_order') {
    if (!empty($data->vendor_id) && !empty($data->customer_phone)) {
        // 1. Calculate Risk Score
        $risk = $order->calculateRiskScore($data->customer_phone);
        
        $order->vendor_id = $data->vendor_id;
        $order->customer_name = $data->customer_name;
        $order->customer_email = $data->customer_email;
        $order->customer_phone = $data->customer_phone;
        $order->total = $data->total;
        $order->risk_score = $risk['score'];
        $order->risk_level = $risk['level'];

        if ($order->create()) {
            // 2. Add Transaction for Vendor
            $transaction->vendor_id = $data->vendor_id;
            $transaction->amount = $data->total;
            $transaction->type = 'sale';
            $transaction->description = "Order #" . $order->id;
            $transaction->create();

            // 3. Update Vendor Balance
            $vendor->uid = $data->vendor_id;
            $vendor->balance += $data->total;
            $vendor->save();

            http_response_code(201);
            echo json_encode([
                "message" => "Order placed successfully.",
                "order_id" => $order->id,
                "risk_score" => $order->risk_score,
                "risk_level" => $order->risk_level
            ]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to place order."]);
        }
    }
} else if ($action == 'track_order') {
    $tracking_id = isset($_GET['tracking_id']) ? $_GET['tracking_id'] : '';
    if (!empty($tracking_id)) {
        $result = $order->readByTracking($tracking_id);
        if ($result) {
            echo json_encode($result);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Order not found."]);
        }
    }
} else if ($action == 'create_shipment') {
    $order_id = isset($_GET['order_id']) ? $_GET['order_id'] : '';
    if (!empty($order_id)) {
        $order->id = $order_id;
        if ($order->createShipment()) {
            echo json_encode(["message" => "Shipment created.", "tracking_id" => $order->tracking_id]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create shipment."]);
        }
    }
}
?>
