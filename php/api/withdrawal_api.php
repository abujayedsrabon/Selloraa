<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");

// Mocking DB connection for now
$db = null; 

include_once '../models/Withdrawal.php';
include_once '../models/Vendor.php';
include_once '../models/Transaction.php';

$withdrawal = new Withdrawal($db);
$vendor = new Vendor($db);
$transaction = new Transaction($db);

$data = json_decode(file_get_contents("php://input"));

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action == 'request_withdrawal') {
    if (!empty($data->vendor_id) && !empty($data->amount)) {
        // 1. Check Vendor Balance
        $vendor->uid = $data->vendor_id;
        $vendor->readOneByUid($data->vendor_id);
        
        if ($vendor->balance >= $data->amount) {
            // 2. Create Withdrawal Request
            $withdrawal->vendor_id = $data->vendor_id;
            $withdrawal->amount = $data->amount;
            $withdrawal->payment_method = $data->payment_method;
            $withdrawal->payment_details = $data->payment_details;

            if ($withdrawal->create()) {
                // 3. Deduct Vendor Balance
                $vendor->balance -= $data->amount;
                $vendor->save();

                // 4. Create Transaction
                $transaction->vendor_id = $data->vendor_id;
                $transaction->amount = -$data->amount;
                $transaction->type = 'withdrawal';
                $transaction->description = "Withdrawal request for $" . $data->amount;
                $transaction->create();

                http_response_code(201);
                echo json_encode(["message" => "Withdrawal request submitted successfully."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to submit withdrawal request."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Insufficient balance."]);
        }
    }
} else if ($action == 'vendor_withdrawals') {
    $vendor_id = isset($_GET['vendor_id']) ? $_GET['vendor_id'] : '';
    if (!empty($vendor_id)) {
        $withdrawals = $withdrawal->readAllByVendor($vendor_id);
        echo json_encode($withdrawals);
    }
}
?>
