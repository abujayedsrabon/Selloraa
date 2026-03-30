<?php
// models/OTP.php
// Logic for generating and verifying OTPs

class OTP {
    private $conn;
    private $table_name = "otps"; // You might want a table to store active OTPs

    public function __construct($db) {
        $this->conn = $db;
    }

    // Generate a random 6-digit OTP
    public function generate() {
        return rand(100000, 999999);
    }

    // Mock function to send SMS
    public function sendSMS($phone, $otp) {
        // In a real app, you would integrate with an SMS gateway like Twilio or Vonage
        // SMS Integration Structure:
        // $api_key = "YOUR_API_KEY";
        // $message = "Your Selloraa verification code is: " . $otp;
        // $url = "https://api.sms-gateway.com/send?key=$api_key&to=$phone&msg=" . urlencode($message);
        // file_get_contents($url);
        
        error_log("SMS sent to $phone: Your Selloraa verification code is: $otp");
        return true;
    }

    // Get OTP price from settings
    public function getOtpPrice() {
        $query = "SELECT setting_value FROM settings WHERE setting_key = 'otp_price' LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? (float)$row['setting_value'] : 0.10;
    }
}
?>
