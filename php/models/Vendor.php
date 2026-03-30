<?php
// models/Vendor.php
// Logic for interacting with the vendors table

class Vendor {
    private $conn;
    private $table_name = "vendors";

    public $id;
    public $uid;
    public $store_name;
    public $slug;
    public $logo;
    public $location;
    public $package_id;
    public $otp_enabled;
    public $balance;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create or Update Vendor
    public function save() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET uid=:uid, store_name=:store_name, slug=:slug, logo=:logo, location=:location, package_id=:package_id, otp_enabled=:otp_enabled, balance=:balance
                  ON DUPLICATE KEY UPDATE 
                  store_name=:store_name, slug=:slug, logo=:logo, location=:location, package_id=:package_id, otp_enabled=:otp_enabled";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->uid = htmlspecialchars(strip_tags($this->uid));
        $this->store_name = htmlspecialchars(strip_tags($this->store_name));
        $this->slug = htmlspecialchars(strip_tags($this->slug));
        $this->logo = htmlspecialchars(strip_tags($this->logo));
        $this->location = htmlspecialchars(strip_tags($this->location));
        $this->package_id = htmlspecialchars(strip_tags($this->package_id));
        $this->otp_enabled = $this->otp_enabled ? 1 : 0;

        // Bind data
        $stmt->bindParam(":uid", $this->uid);
        $stmt->bindParam(":store_name", $this->store_name);
        $stmt->bindParam(":slug", $this->slug);
        $stmt->bindParam(":logo", $this->logo);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":package_id", $this->package_id);
        $stmt->bindParam(":otp_enabled", $this->otp_enabled);
        $stmt->bindParam(":balance", $this->balance);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Deduct balance for OTP
    public function deductBalance($amount) {
        $query = "UPDATE " . $this->table_name . " SET balance = balance - :amount WHERE uid = :uid AND balance >= :amount";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":amount", $amount);
        $stmt->bindParam(":uid", $this->uid);
        if($stmt->execute() && $stmt->rowCount() > 0) {
            return true;
        }
        return false;
    }

    // Read single vendor by UID
    public function readOneByUid($uid) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE uid = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $uid);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->uid = $row['uid'];
            $this->store_name = $row['store_name'];
            $this->slug = $row['slug'];
            $this->logo = $row['logo'];
            $this->location = $row['location'];
            $this->package_id = $row['package_id'];
            $this->otp_enabled = $row['otp_enabled'];
            $this->balance = $row['balance'];
            return true;
        }
        return false;
    }
}
?>
