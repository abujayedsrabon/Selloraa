import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// --- MOCK PHP API FOR PREVIEW ---
let mockVendors: any = {
    'V_123': { uid: 'V_123', store_name: 'Minimalist Store', slug: 'minimalist-store', location: 'London, UK', balance: 500.00, otp_enabled: true, logo: 'https://picsum.photos/seed/logo/200/200' }
};
let mockUsers: any = {
    'admin@selloraa.com': { uid: 'ADMIN_UID', email: 'admin@selloraa.com', password: 'admin', role: 'admin' },
    'vendor@test.com': { uid: 'V_123', email: 'vendor@test.com', password: 'password', role: 'vendor' }
};
let mockOrders: any[] = [
    { id: '1024', vendor_id: 'V_123', customer_name: 'Alice Smith', total: 120.50, risk_level: 'Low', status: 'pending', tracking_id: 'SLR-ABC123' }
];
let mockTransactions: any[] = [];
let mockWithdrawals: any[] = [
    { id: 1, vendor_id: 'V_123', store_name: 'Minimalist Store', amount: 500, payment_method: 'bkash', status: 'pending' }
];
let mockProducts: any[] = [
    { id: 1, vendor_id: 'V_123', name: 'Essential Chair', price: 299, image: 'https://picsum.photos/seed/chair/800/1000' },
    { id: 2, vendor_id: 'V_123', name: 'Ceramic Vase', price: 45, image: 'https://picsum.photos/seed/vase/800/1000' },
    { id: 3, vendor_id: 'V_123', name: 'Linen Throw', price: 89, image: 'https://picsum.photos/seed/linen/800/1000' },
    { id: 4, vendor_id: 'V_123', name: 'Oak Table', price: 550, image: 'https://picsum.photos/seed/table/800/1000' }
];
let otpPrice = 0.10;

app.all("/php/api/auth_api.php", (req, res) => {
    const { action, email, password, store_name, location } = req.body;
    
    if (action === 'register') {
        if (mockUsers[email]) return res.status(400).json({ message: "User already exists." });
        const uid = 'V_' + Math.random().toString(36).substr(2, 9);
        const slug = store_name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        mockUsers[email] = { uid, email, password, role: 'vendor' };
        mockVendors[uid] = { uid, store_name, slug, location, balance: 0, otp_enabled: true };
        return res.json({ message: "Registration successful.", uid });
    }
    
    if (action === 'login') {
        const user = mockUsers[email];
        if (user && user.password === password) {
            return res.json({ message: "Login successful.", uid: user.uid, role: user.role });
        }
        return res.status(401).json({ message: "Invalid credentials." });
    }
});

app.all("/php/api/vendor_api.php", (req, res) => {
    const uid = (req.query.uid || req.body.uid) as string;
    if (req.method === "POST") {
        const { store_name, logo, location, otp_enabled } = req.body;
        if (mockVendors[uid]) {
            const slug = store_name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            mockVendors[uid] = { ...mockVendors[uid], store_name, slug, logo, location, otp_enabled };
            return res.json({ message: "Store updated.", slug });
        }
        return res.status(404).json({ message: "Vendor not found." });
    } else if (req.method === "GET") {
        const slug = req.query.slug as string;
        if (slug) {
            const vendor = Object.values(mockVendors).find((v: any) => v.slug === slug);
            return vendor ? res.json(vendor) : res.status(404).json({ message: "Store not found." });
        }
        return mockVendors[uid] ? res.json(mockVendors[uid]) : res.status(404).json({ message: "Vendor not found." });
    }
});

app.all("/php/api/otp_api.php", (req, res) => {
    const { action, vendor_uid, phone, otp, user_input_otp } = req.body;
    if (action === 'send_otp') {
        if (mockVendors[vendor_uid]) {
            if (mockVendors[vendor_uid].balance >= otpPrice) {
                mockVendors[vendor_uid].balance -= otpPrice;
                return res.json({ message: "OTP sent.", otp: '123456' });
            }
            return res.status(402).json({ message: "Insufficient balance." });
        }
        return res.status(404).json({ message: "Vendor not found." });
    }
    if (action === 'verify_otp') {
        return (otp == user_input_otp || user_input_otp == '123456') ? res.json({ message: "Verified" }) : res.status(401).json({ message: "Invalid OTP" });
    }
});

app.all("/php/api/order_api.php", (req, res) => {
    const action = req.query.action;
    if (action === 'place_order') {
        const { vendor_id, total, customer_name } = req.body;
        if (mockVendors[vendor_id]) {
            mockVendors[vendor_id].balance += total;
            const orderId = Math.floor(1000 + Math.random() * 9000).toString();
            mockOrders.push({ id: orderId, vendor_id, customer_name, total, status: 'pending', risk_level: 'Low' });
            return res.json({ message: "Order placed", order_id: orderId });
        }
        return res.status(404).json({ message: "Vendor not found" });
    }
    if (action === 'track_order') {
        return res.json({ customer_name: 'John Doe', courier_status: 'In Transit', status: 'shipped' });
    }
});

app.all("/php/api/admin_api.php", (req, res) => {
    const action = req.query.action;
    if (action === 'dashboard') {
        return res.json({ total_revenue: 12500.50, total_vendors: Object.keys(mockVendors).length, total_orders: mockOrders.length });
    }
    if (action === 'orders') {
        const vendor_id = req.query.vendor_id as string;
        if (vendor_id) return res.json(mockOrders.filter(o => o.vendor_id === vendor_id));
        return res.json(mockOrders);
    }
    if (action === 'withdrawals') return res.json(mockWithdrawals);
    if (action === 'approve_withdrawal') {
        const { id } = req.body;
        const w = mockWithdrawals.find(w => w.id == id);
        if (w) w.status = 'approved';
        return res.json({ message: "Approved" });
    }
    if (action === 'set_otp_price') {
        otpPrice = req.body.price;
        return res.json({ message: "Price updated" });
    }
});

app.all("/php/api/product_api.php", (req, res) => {
    const action = req.query.action;
    const vendor_id = (req.query.vendor_id || req.body.vendor_id) as string;
    
    if (action === 'list') {
        const products = mockProducts.filter(p => p.vendor_id === vendor_id);
        return res.json(products);
    }
    if (action === 'add') {
        const { name, price, image } = req.body;
        const newProduct = { id: mockProducts.length + 1, vendor_id, name, price, image };
        mockProducts.push(newProduct);
        return res.json({ message: "Product added", product: newProduct });
    }
    if (action === 'delete') {
        const { id } = req.body;
        mockProducts = mockProducts.filter(p => p.id != id);
        return res.json({ message: "Product deleted" });
    }
});

app.all("/php/api/withdrawal_api.php", (req, res) => {
    const action = req.query.action;
    if (action === 'request_withdrawal') {
        const { vendor_id, amount, payment_method } = req.body;
        if (mockVendors[vendor_id] && mockVendors[vendor_id].balance >= amount) {
            mockVendors[vendor_id].balance -= amount;
            mockWithdrawals.push({ id: mockWithdrawals.length + 1, vendor_id, store_name: mockVendors[vendor_id].store_name, amount, payment_method, status: 'pending' });
            return res.json({ message: "Requested" });
        }
        return res.status(400).json({ message: "Insufficient balance" });
    }
});

// Serve the traditional frontend as the root
app.use(express.static(path.join(__dirname, "traditional-frontend")));

// Fallback to index.html for SPA-like behavior if needed
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "traditional-frontend", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Traditional Stack Preview running at http://localhost:${PORT}`);
});
