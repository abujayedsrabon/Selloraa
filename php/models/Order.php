<?php
class Order {
    private $conn;
    private $table_name = "orders";

    public $id;
    public $vendor_id;
    public $customer_name;
    public $customer_email;
    public $customer_phone;
    public $total;
    public $status;
    public $risk_score;
    public $risk_level;
    public $tracking_id;
    public $courier_status;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Calculate Fake Order Probability Score (Mock)
    public function calculateRiskScore($phone) {
        // In a real app, this would call a Courier API or Fraud Detection service
        // For now, we'll simulate it based on phone number patterns
        $score = rand(0, 100);
        
        // Example logic: certain prefixes are higher risk
        if (strpos($phone, '555') !== false) $score += 20;
        if (strlen($phone) < 10) $score += 30;
        
        $score = min(100, $score);
        
        $level = 'low';
        if ($score > 70) $level = 'high';
        else if ($score > 30) $level = 'medium';
        
        return ['score' => $score, 'level' => $level];
    }

    // Create Order
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                SET vendor_id=:vendor_id, customer_name=:customer_name, customer_email=:customer_email, 
                    customer_phone=:customer_phone, total=:total, risk_score=:risk_score, risk_level=:risk_level";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":vendor_id", $this->vendor_id);
        $stmt->bindParam(":customer_name", $this->customer_name);
        $stmt->bindParam(":customer_email", $this->customer_email);
        $stmt->bindParam(":customer_phone", $this->customer_phone);
        $stmt->bindParam(":total", $this->total);
        $stmt->bindParam(":risk_score", $this->risk_score);
        $stmt->bindParam(":risk_level", $this->risk_level);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Create Shipment (Mock Courier Integration)
    public function createShipment() {
        // Simulate API call to Courier (e.g., Pathao, RedX, Steadfast)
        $tracking_id = "SLR-" . strtoupper(substr(md5(uniqid()), 0, 8));
        
        $query = "UPDATE " . $this->table_name . " 
                SET tracking_id=:tracking_id, status='shipped', courier_status='In Transit' 
                WHERE id=:id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":tracking_id", $tracking_id);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }

    // Get Order by Tracking ID
    public function readByTracking($tracking_id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE tracking_id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $tracking_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
