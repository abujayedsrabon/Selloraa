<?php
class Transaction {
    private $conn;
    private $table_name = "transactions";

    public $id;
    public $vendor_id;
    public $amount;
    public $type;
    public $description;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                SET vendor_id=:vendor_id, amount=:amount, type=:type, description=:description";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":vendor_id", $this->vendor_id);
        $stmt->bindParam(":amount", $this->amount);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":description", $this->description);

        return $stmt->execute();
    }

    public function readAllByVendor($vendor_id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE vendor_id = ? ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $vendor_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

class Withdrawal {
    private $conn;
    private $table_name = "withdrawals";

    public $id;
    public $vendor_id;
    public $amount;
    public $status;
    public $payment_method;
    public $payment_details;
    public $created_at;
    public $processed_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                SET vendor_id=:vendor_id, amount=:amount, payment_method=:payment_method, payment_details=:payment_details";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":vendor_id", $this->vendor_id);
        $stmt->bindParam(":amount", $this->amount);
        $stmt->bindParam(":payment_method", $this->payment_method);
        $stmt->bindParam(":payment_details", $this->payment_details);

        return $stmt->execute();
    }

    public function approve($id) {
        $query = "UPDATE " . $this->table_name . " 
                SET status='approved', processed_at=NOW() WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }

    public function readAll() {
        $query = "SELECT w.*, v.store_name FROM " . $this->table_name . " w 
                JOIN vendors v ON w.vendor_id = v.uid ORDER BY w.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
