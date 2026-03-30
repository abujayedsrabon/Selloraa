import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, getDoc, setDoc, query, where, onSnapshot, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Vendor, Product, Order } from '../types';
import { LayoutDashboard, Store, Package, ShoppingCart, LogOut, Plus, Edit, Trash, CheckCircle, Truck, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const VendorDashboard: React.FC = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'store' | 'products' | 'orders' | 'packages'>('overview');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const vendorDoc = await getDoc(doc(db, 'vendors', user.uid));
        if (vendorDoc.exists()) {
          setVendor(vendorDoc.data() as Vendor);
        } else {
          setActiveTab('store'); // Force store setup if not exists
        }
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `vendors/${user.uid}`);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!vendor) return;

    const productsQuery = query(collection(db, 'products'), where('vendorId', '==', vendor.uid));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    const ordersQuery = query(collection(db, 'orders'), where('vendorId', '==', vendor.uid));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'orders'));

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, [vendor]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-orange-600">Selloraa</h1>
          <p className="text-xs text-gray-500 mt-1">Vendor Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
          />
          <SidebarItem 
            icon={<Store size={20} />} 
            label="Store Builder" 
            active={activeTab === 'store'} 
            onClick={() => setActiveTab('store')} 
          />
          <SidebarItem 
            icon={<Package size={20} />} 
            label="Products" 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
          />
          <SidebarItem 
            icon={<ShoppingCart size={20} />} 
            label="Orders" 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')} 
          />
          <SidebarItem 
            icon={<CheckCircle size={20} />} 
            label="Packages" 
            active={activeTab === 'packages'} 
            onClick={() => setActiveTab('packages')} 
          />
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => auth.signOut()}
            className="flex items-center gap-3 w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            {vendor && (
              <a 
                href={`/s/${vendor.slug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-orange-600 hover:underline font-medium"
              >
                View Store
              </a>
            )}
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
              {auth.currentUser?.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard title="Total Sales" value={`$${orders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}`} icon={<ShoppingCart className="text-blue-600" />} />
                  <StatCard title="Total Orders" value={orders.length.toString()} icon={<ShoppingCart className="text-green-600" />} />
                  <StatCard title="Total Products" value={products.length.toString()} icon={<Package className="text-orange-600" />} />
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No orders yet.</p>
                  ) : (
                    <OrderTable orders={orders.slice(0, 5)} />
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'store' && (
              <motion.div 
                key="store"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <StoreBuilder vendor={vendor} onSave={(v) => setVendor(v)} />
              </motion.div>
            )}

            {activeTab === 'products' && (
              <motion.div 
                key="products"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ProductManager vendorId={vendor?.uid || ''} products={products} />
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">All Orders</h3>
                  <OrderTable orders={orders} showActions />
                </div>
              </motion.div>
            )}

            {activeTab === 'packages' && (
              <motion.div 
                key="packages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-6">Subscription Packages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Starter', 'Professional', 'Enterprise'].map((pkg, i) => (
                      <div key={pkg} className={cn(
                        "p-6 rounded-xl border-2 transition-all",
                        vendor?.packageId === pkg ? "border-orange-600 bg-orange-50" : "border-gray-100 hover:border-orange-200"
                      )}>
                        <h4 className="font-bold text-lg mb-2">{pkg}</h4>
                        <p className="text-2xl font-bold mb-4">${[29, 79, 199][i]}<span className="text-sm text-gray-500 font-normal">/mo</span></p>
                        <ul className="text-sm text-gray-600 space-y-2 mb-6">
                          <li>• Up to {[10, 100, 'Unlimited'][i]} products</li>
                          <li>• Basic analytics</li>
                          <li>• Email support</li>
                        </ul>
                        <button 
                          onClick={async () => {
                            if (!vendor) return;
                            try {
                              await updateDoc(doc(db, 'vendors', vendor.uid), { packageId: pkg });
                              setVendor({ ...vendor, packageId: pkg });
                              alert(`Successfully subscribed to ${pkg} plan!`);
                            } catch (e) {
                              alert('Failed to update package.');
                            }
                          }}
                          className={cn(
                            "w-full py-2 rounded-lg font-bold transition-all",
                            vendor?.packageId === pkg ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          )}
                        >
                          {vendor?.packageId === pkg ? 'Current Plan' : 'Select Plan'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all duration-200",
      active ? "bg-orange-50 text-orange-600 font-medium" : "text-gray-600 hover:bg-gray-50"
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
    </div>
    <div className="p-3 bg-gray-50 rounded-lg">
      {icon}
    </div>
  </div>
);

// --- Store Builder Component ---
const StoreBuilder: React.FC<{ vendor: Vendor | null; onSave: (v: Vendor) => void }> = ({ vendor, onSave }) => {
  const [formData, setFormData] = useState({
    storeName: vendor?.storeName || '',
    logo: vendor?.logo || '',
    location: vendor?.location || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setSaving(true);

    const slug = formData.storeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const vendorData: Vendor = {
      uid: auth.currentUser.uid,
      storeName: formData.storeName,
      slug,
      logo: formData.logo,
      location: formData.location,
      createdAt: vendor?.createdAt || serverTimestamp(),
    };

    try {
      // Check if slug is taken (simplified check)
      const slugDoc = await getDoc(doc(db, 'slugs', slug));
      if (slugDoc.exists() && slugDoc.data().vendorId !== auth.currentUser.uid) {
        alert('Store name already taken. Please choose another.');
        setSaving(false);
        return;
      }

      await setDoc(doc(db, 'vendors', auth.currentUser.uid), vendorData);
      await setDoc(doc(db, 'slugs', slug), { vendorId: auth.currentUser.uid });
      onSave(vendorData);
      alert('Store updated successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'vendors');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-2xl">
      <h3 className="text-xl font-bold mb-6">Store Configuration</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <input 
            type="text" 
            required
            value={formData.storeName}
            onChange={e => setFormData({ ...formData, storeName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            placeholder="e.g. My Awesome Shop"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Logo URL</label>
          <input 
            type="url" 
            value={formData.logo}
            onChange={e => setFormData({ ...formData, logo: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            placeholder="https://example.com/logo.png"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input 
            type="text" 
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            placeholder="e.g. New York, USA"
          />
        </div>
        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Store Details'}
        </button>
      </form>
    </div>
  );
};

// --- Product Manager Component ---
const ProductManager: React.FC<{ vendorId: string; products: Product[] }> = ({ vendorId, products }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Manage Products</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors"
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="h-48 bg-gray-100 relative">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package size={48} />
                </div>
              )}
            </div>
            <div className="p-4 flex-1">
              <h4 className="font-bold text-lg">{product.name}</h4>
              <p className="text-gray-500 text-sm line-clamp-2 mt-1">{product.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-orange-600 font-bold">${product.price.toFixed(2)}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Stock: {product.stock}</span>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <button 
                onClick={() => setEditingProduct(product)}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => handleDelete(product.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-100 transition-colors"
              >
                <Trash size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Form Modal */}
      {(isAdding || editingProduct) && (
        <ProductForm 
          vendorId={vendorId} 
          product={editingProduct} 
          onClose={() => { setIsAdding(false); setEditingProduct(null); }} 
        />
      )}
    </div>
  );
};

const ProductForm: React.FC<{ vendorId: string; product?: Product | null; onClose: () => void }> = ({ vendorId, product, onClose }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    imageUrl: product?.imageUrl || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const productData = {
      ...formData,
      vendorId,
      price: Number(formData.price),
      stock: Number(formData.stock),
      createdAt: product?.createdAt || serverTimestamp(),
    };

    try {
      if (product) {
        await updateDoc(doc(db, 'products', product.id), productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
      >
        <h3 className="text-xl font-bold mb-6">{product ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input 
              type="text" required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input 
                type="number" step="0.01" required
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input 
                type="number" required
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input 
              type="url"
              value={formData.imageUrl}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="flex-1 bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- Order Table Component ---
const OrderTable: React.FC<{ orders: Order[]; showActions?: boolean }> = ({ orders, showActions }) => {
  const updateStatus = async (id: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-400 text-sm uppercase tracking-wider border-b border-gray-100">
            <th className="pb-4 font-medium">Order ID</th>
            <th className="pb-4 font-medium">Customer</th>
            <th className="pb-4 font-medium">Total</th>
            <th className="pb-4 font-medium">Status</th>
            <th className="pb-4 font-medium">Risk Score</th>
            {showActions && <th className="pb-4 font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map(order => (
            <tr key={order.id} className="text-sm">
              <td className="py-4 font-mono text-xs text-gray-500">#{order.id.slice(-6)}</td>
              <td className="py-4">
                <div className="font-medium text-gray-900">{order.customerName}</div>
                <div className="text-xs text-gray-500">{order.customerEmail}</div>
              </td>
              <td className="py-4 font-semibold text-gray-900">${order.total.toFixed(2)}</td>
              <td className="py-4">
                <StatusBadge status={order.status} />
              </td>
              <td className="py-4">
                <RiskBadge score={order.fakeProbability || 0} />
              </td>
              {showActions && (
                <td className="py-4">
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(order.id, 'confirmed')} title="Confirm" className="p-1 text-blue-600 hover:bg-blue-50 rounded"><CheckCircle size={16} /></button>
                    <button onClick={() => updateStatus(order.id, 'shipped')} title="Ship" className="p-1 text-orange-600 hover:bg-orange-50 rounded"><Truck size={16} /></button>
                    <button onClick={() => updateStatus(order.id, 'delivered')} title="Deliver" className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckCircle size={16} /></button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const styles = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
    confirmed: "bg-blue-50 text-blue-700 border-blue-100",
    shipped: "bg-orange-50 text-orange-700 border-orange-100",
    delivered: "bg-green-50 text-green-700 border-green-100",
  };
  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium border capitalize", styles[status])}>
      {status}
    </span>
  );
};

const RiskBadge: React.FC<{ score: number }> = ({ score }) => {
  const isHigh = score > 0.7;
  const isMed = score > 0.3;
  return (
    <div className={cn(
      "flex items-center gap-1 text-xs font-medium",
      isHigh ? "text-red-600" : isMed ? "text-yellow-600" : "text-green-600"
    )}>
      {isHigh && <AlertTriangle size={12} />}
      <span>{(score * 100).toFixed(0)}%</span>
    </div>
  );
};

export default VendorDashboard;
