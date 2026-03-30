<?php
// api/vendor_api.php
// API endpoint for AJAX calls

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';
include_once '../models/Vendor.php';

$database = new Database();
$db = $database->getConnection();

$vendor = new Vendor($db);

// Get data from request body
$data = json_decode(file_get_contents("php://input"));

if($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle Save Vendor (Store Builder)
    if(!empty($data->uid) && !empty($data->store_name)) {
        $vendor->uid = $data->uid;
        $vendor->store_name = $data->store_name;
        $vendor->slug = strtolower(preg_replace('/[^A-Za-z0-9-]+/', '-', $data->store_name));
        $vendor->logo = $data->logo;
        $vendor->location = $data->location;
        $vendor->package_id = $data->package_id;
        $vendor->otp_enabled = isset($data->otp_enabled) ? $data->otp_enabled : false;
        $vendor->balance = isset($data->balance) ? $data->balance : 0.00;

        if($vendor->save()) {
            http_response_code(201);
            echo json_encode(array("message" => "Vendor store updated successfully.", "slug" => $vendor->slug));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update vendor store."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data."));
    }
} elseif($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Handle Get Vendor by UID
    if(!empty($_GET['uid'])) {
        if($vendor->readOneByUid($_GET['uid'])) {
            $vendor_item = array(
                "uid" => $vendor->uid,
                "store_name" => $vendor->store_name,
                "slug" => $vendor->slug,
                "logo" => $vendor->logo,
                "location" => $vendor->location,
                "package_id" => $vendor->package_id,
                "otp_enabled" => $vendor->otp_enabled,
                "balance" => $vendor->balance
            );
            http_response_code(200);
            echo json_encode($vendor_item);
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Vendor not found."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Missing UID."));
    }
}
?>
