<?php
// api/otp_api.php
// API endpoint for sending and verifying OTPs

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';
include_once '../models/Vendor.php';
include_once '../models/OTP.php';

$database = new Database();
$db = $database->getConnection();

$vendor = new Vendor($db);
$otp_manager = new OTP($db);

// Get data from request body
$data = json_decode(file_get_contents("php://input"));

if($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Action: send_otp
    if($data->action === 'send_otp') {
        if(!empty($data->vendor_uid) && !empty($data->phone)) {
            if($vendor->readOneByUid($data->vendor_uid)) {
                $otp_price = $otp_manager->getOtpPrice();

                // Check if vendor has enough balance
                if($vendor->balance >= $otp_price) {
                    $otp = $otp_manager->generate();
                    
                    // Send SMS (mock)
                    if($otp_manager->sendSMS($data->phone, $otp)) {
                        // Deduct balance
                        if($vendor->deductBalance($otp_price)) {
                            // Store OTP in session or database for verification
                            // For simplicity, we'll return it in this mock, but in a real app, 
                            // you'd store it and only return success.
                            http_response_code(200);
                            echo json_encode(array(
                                "message" => "OTP sent successfully.",
                                "otp" => $otp, // Don't return this in production!
                                "new_balance" => $vendor->balance - $otp_price
                            ));
                        } else {
                            http_response_code(500);
                            echo json_encode(array("message" => "Failed to deduct balance."));
                        }
                    } else {
                        http_response_code(500);
                        echo json_encode(array("message" => "Failed to send SMS."));
                    }
                } else {
                    http_response_code(402); // Payment Required
                    echo json_encode(array("message" => "Insufficient balance. Please recharge."));
                }
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Vendor not found."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Incomplete data."));
        }
    }
    // Action: verify_otp
    elseif($data->action === 'verify_otp') {
        if(!empty($data->otp) && !empty($data->user_input_otp)) {
            if($data->otp == $data->user_input_otp) {
                http_response_code(200);
                echo json_encode(array("message" => "OTP verified successfully."));
            } else {
                http_response_code(401);
                echo json_encode(array("message" => "Invalid OTP."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Missing OTP data."));
        }
    }
}
?>
